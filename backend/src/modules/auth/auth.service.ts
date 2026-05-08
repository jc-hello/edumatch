import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
  GoneException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { User, UserRole } from '../../database/entities/user.entity';
import { TokenBlacklist } from '../../database/entities/token-blacklist.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthDto } from './dto/oauth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TokenBlacklist)
    private tokenBlacklistRepo: Repository<TokenBlacklist>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateTokenPair(userId: string, role: UserRole) {
    const jti = uuidv4();
    const accessToken = this.jwtService.sign(
      { sub: userId, role, jti },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn') as any,
      },
    );

    const refreshToken = uuidv4();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    return { accessToken, refreshToken, refreshTokenHash, jti };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, refreshTokenHash, ...sanitized } = user as any;
    return sanitized;
  }

  async register(dto: RegisterDto) {
    try {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = this.userRepo.create({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role as UserRole,
      });

      await this.userRepo.save(user);

      // TODO: Queue email verification job via BullMQ

      const { accessToken, refreshToken, refreshTokenHash } = await this.generateTokenPair(user.id, user.role);
      await this.userRepo.update(user.id, { refreshTokenHash });

      return { accessToken, refreshToken, user: this.sanitizeUser(user) };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { email: dto.email },
        select: ['id', 'email', 'passwordHash', 'fullName', 'role', 'avatarUrl', 'phone', 'isActive', 'isDeleted', 'emailVerified', 'createdAt', 'updatedAt'],
      });

      if (!user || user.isDeleted || !user.isActive) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.passwordHash) {
        throw new UnauthorizedException('Please use OAuth to login');
      }

      const valid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { accessToken, refreshToken, refreshTokenHash } = await this.generateTokenPair(user.id, user.role);
      await this.userRepo.update(user.id, { refreshTokenHash });

      return { accessToken, refreshToken, user: this.sanitizeUser(user) };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async oauth(dto: OAuthDto) {
    try {
      let email: string;
      let fullName: string;
      let avatarUrl: string;

      if (dto.provider === 'google') {
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(this.configService.get('oauth.google.clientId'));
        const ticket = await client.verifyIdToken({
          idToken: dto.idToken,
          audience: this.configService.get('oauth.google.clientId'),
        });
        const payload = ticket.getPayload();
        email = payload.email;
        fullName = payload.name;
        avatarUrl = payload.picture;
      } else {
        const response = await axios.get(
          `https://graph.facebook.com/me?fields=id,email,name,picture&access_token=${dto.idToken}`,
        );
        email = response.data.email;
        fullName = response.data.name;
        avatarUrl = response.data.picture?.data?.url;
      }

      let user = await this.userRepo.findOne({ where: { email } });

      if (!user) {
        user = this.userRepo.create({
          email,
          fullName,
          avatarUrl,
          emailVerified: true,
          passwordHash: null,
          role: UserRole.STUDENT,
        });
        await this.userRepo.save(user);
      }

      if (user.isDeleted || !user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }

      const { accessToken, refreshToken, refreshTokenHash } = await this.generateTokenPair(user.id, user.role);
      await this.userRepo.update(user.id, { refreshTokenHash });

      return { accessToken, refreshToken, user: this.sanitizeUser(user) };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('OAuth login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const users = await this.userRepo.find({
        where: { isDeleted: false, isActive: true },
        select: ['id', 'email', 'fullName', 'role', 'refreshTokenHash'],
      });

      let matchedUser: User | null = null;
      for (const u of users) {
        if (u.refreshTokenHash && (await bcrypt.compare(dto.refreshToken, u.refreshTokenHash))) {
          matchedUser = u;
          break;
        }
      }

      if (!matchedUser) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { accessToken, refreshToken, refreshTokenHash } = await this.generateTokenPair(matchedUser.id, matchedUser.role);
      await this.userRepo.update(matchedUser.id, { refreshTokenHash });

      return { accessToken, refreshToken };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Token refresh failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async logout(userId: string, jti: string, tokenExp: number) {
    try {
      await this.tokenBlacklistRepo.save({
        jti,
        expiresAt: new Date(tokenExp * 1000),
      });
      await this.userRepo.update(userId, { refreshTokenHash: null });
      return { message: 'Logged out successfully' };
    } catch (e) {
      throw new HttpException('Logout failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyEmail(token: string) {
    try {
      let payload: any;
      try {
        payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('jwt.emailVerifySecret'),
        });
      } catch {
        throw new BadRequestException('Invalid or expired token');
      }

      await this.userRepo.update(payload.sub, { emailVerified: true });
      return { message: 'Email verified successfully' };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Email verification failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.userRepo.findOne({ where: { email: dto.email, isDeleted: false } });
      if (user) {
        // TODO: Queue reset email job via BullMQ
        // const jti = uuidv4();
        // const token = this.jwtService.sign({ sub: user.id, jti }, {
        //   secret: this.configService.get('jwt.resetPasswordSecret'), expiresIn: '1h'
        // });
      }
      return { message: 'If the email exists, a reset link has been sent' };
    } catch (e) {
      return { message: 'If the email exists, a reset link has been sent' };
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      let payload: any;
      try {
        payload = this.jwtService.verify(dto.token, {
          secret: this.configService.get<string>('jwt.resetPasswordSecret'),
        });
      } catch {
        throw new BadRequestException('Invalid or expired token');
      }

      const blacklisted = await this.tokenBlacklistRepo.findOne({ where: { jti: payload.jti } });
      if (blacklisted) {
        throw new BadRequestException('Token has already been used');
      }

      const passwordHash = await bcrypt.hash(dto.newPassword, 12);
      await this.userRepo.update(payload.sub, { passwordHash, refreshTokenHash: null });

      await this.tokenBlacklistRepo.save({
        jti: payload.jti,
        expiresAt: new Date(payload.exp * 1000),
      });

      return { message: 'Password reset successfully' };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Password reset failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
