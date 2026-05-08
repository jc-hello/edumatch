import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBlacklist } from '../../../database/entities/token-blacklist.entity';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(TokenBlacklist)
    private tokenBlacklistRepo: Repository<TokenBlacklist>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const blacklisted = await this.tokenBlacklistRepo.findOne({ where: { jti: payload.jti } });
    if (blacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'fullName', 'role', 'avatarUrl', 'phone', 'isActive', 'isDeleted', 'emailVerified', 'createdAt', 'updatedAt'],
    });

    if (!user || user.isDeleted || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return { ...user, jti: payload.jti, exp: payload.exp };
  }
}
