import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  GoneException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { TokenBlacklist } from '../../database/entities/token-blacklist.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TokenBlacklist)
    private tokenBlacklistRepo: Repository<TokenBlacklist>,
  ) {}

  private sanitizeUser(user: User) {
    const { passwordHash, refreshTokenHash, ...sanitized } = user as any;
    return sanitized;
  }

  async getMe(userId: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId, isDeleted: false },
        select: ['id', 'email', 'fullName', 'role', 'avatarUrl', 'phone', 'isActive', 'emailVerified', 'createdAt', 'updatedAt'],
      });

      if (!user) throw new NotFoundException('User not found');

      // TODO: If role === 'tutor', eager load tutor_profiles + tutor_subjects (TutorProfile module not yet implemented)
      return this.sanitizeUser(user);
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Failed to get user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId, isDeleted: false } });
      if (!user) throw new NotFoundException('User not found');

      const updates: Partial<User> = {};
      if (dto.fullName !== undefined) updates.fullName = dto.fullName;
      if (dto.phone !== undefined) updates.phone = dto.phone;
      if (dto.avatarUrl !== undefined) updates.avatarUrl = dto.avatarUrl;

      await this.userRepo.update(userId, updates);

      const updated = await this.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'email', 'fullName', 'role', 'avatarUrl', 'phone', 'isActive', 'emailVerified', 'createdAt', 'updatedAt'],
      });

      return this.sanitizeUser(updated);
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Profile update failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId, isDeleted: false },
        select: ['id', 'passwordHash'],
      });

      if (!user) throw new NotFoundException('User not found');
      if (!user.passwordHash) throw new BadRequestException('No password set for this account');

      const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Current password is incorrect');

      const same = await bcrypt.compare(dto.newPassword, user.passwordHash);
      if (same) throw new BadRequestException('New password must be different from current password');

      const passwordHash = await bcrypt.hash(dto.newPassword, 12);
      await this.userRepo.update(userId, { passwordHash, refreshTokenHash: null });

      return { message: 'Password updated successfully' };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Password change failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAccount(userId: string, jti: string, tokenExp: number) {
    try {
      await this.userRepo.update(userId, {
        isDeleted: true,
        deletedAt: new Date(),
        refreshTokenHash: null,
      });

      await this.tokenBlacklistRepo.save({
        jti,
        expiresAt: new Date(tokenExp * 1000),
      });

      return { message: 'Account deleted. You have 30 days to restore it.' };
    } catch (e) {
      throw new HttpException('Account deletion failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async restoreAccount(email: string, password: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { email, isDeleted: true },
        select: ['id', 'email', 'passwordHash', 'deletedAt', 'isDeleted'],
      });

      if (!user) {
        throw new GoneException('Account not found or restoration period expired');
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (user.deletedAt < thirtyDaysAgo) {
        throw new GoneException('Account restoration period has expired');
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Invalid credentials');

      await this.userRepo.update(user.id, { isDeleted: false, deletedAt: null });

      return { message: 'Account restored successfully' };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Account restoration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
