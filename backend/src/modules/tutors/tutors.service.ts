import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { TutorProfile, TutorStatus } from '../../database/entities/tutor-profile.entity';
import { TutorSubject } from '../../database/entities/tutor-subject.entity';
import { Subject } from '../../database/entities/subject.entity';
import { EducationLevel } from '../../database/entities/education-level.entity';
import { Booking, BookingStatus } from '../../database/entities/booking.entity';
import { Review } from '../../database/entities/review.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-profile.dto';
import { AddSubjectDto, UpdateSubjectPriceDto } from './dto/add-subject.dto';
import { SearchTutorsDto, ListReviewsDto } from './dto/search-tutors.dto';
import { NotificationsService } from '../../common/services/notifications.service';

@Injectable()
export class TutorsService {
  constructor(
    @InjectRepository(TutorProfile) private profileRepo: Repository<TutorProfile>,
    @InjectRepository(TutorSubject) private subjectRepo: Repository<TutorSubject>,
    @InjectRepository(Subject) private subjectsRepo: Repository<Subject>,
    @InjectRepository(EducationLevel) private levelsRepo: Repository<EducationLevel>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private notifications: NotificationsService,
  ) {}

  // ── Profile ─────────────────────────────────────────────────────────────
  async createProfile(userId: string, role: UserRole, dto: CreateProfileDto) {
    if (role !== UserRole.TUTOR) {
      throw new ForbiddenException('Only tutor accounts can create a tutor profile');
    }

    const existing = await this.profileRepo.findOne({ where: { userId } });
    if (existing) throw new ConflictException('Tutor profile already exists');

    const profile = this.profileRepo.create({
      userId,
      bio: dto.bio,
      videoUrl: dto.videoUrl,
      languages: dto.languages,
      education: dto.education,
      certificates: dto.certificates,
      teachesOnline: dto.teachesOnline ?? true,
      teachesOffline: dto.teachesOffline ?? false,
      address: dto.address,
      status: TutorStatus.PENDING,
    });
    const saved = await this.profileRepo.save(profile);

    // Notify all admins
    const admins = await this.userRepo.find({
      where: { role: UserRole.ADMIN, isDeleted: false, isActive: true },
      select: ['id'],
    });
    for (const a of admins) {
      await this.notifications.push(
        a.id,
        'tutor_profile_submitted',
        'Hồ sơ gia sư mới chờ duyệt',
        'Một gia sư vừa gửi hồ sơ chờ phê duyệt.',
        { tutorProfileId: saved.id, userId },
      );
    }

    return saved;
  }

  async updateProfile(userId: string, dto: UpdateTutorProfileDto) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Tutor profile not found');

    Object.assign(profile, {
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
      ...(dto.languages !== undefined && { languages: dto.languages }),
      ...(dto.education !== undefined && { education: dto.education }),
      ...(dto.certificates !== undefined && { certificates: dto.certificates }),
      ...(dto.teachesOnline !== undefined && { teachesOnline: dto.teachesOnline }),
      ...(dto.teachesOffline !== undefined && { teachesOffline: dto.teachesOffline }),
      ...(dto.address !== undefined && { address: dto.address }),
    });

    // If previously rejected, resubmit for review
    let resubmitted = false;
    if (profile.status === TutorStatus.REJECTED) {
      profile.status = TutorStatus.PENDING;
      profile.rejectReason = null;
      resubmitted = true;
    }

    const saved = await this.profileRepo.save(profile);

    if (resubmitted) {
      const admins = await this.userRepo.find({
        where: { role: UserRole.ADMIN, isDeleted: false, isActive: true },
        select: ['id'],
      });
      for (const a of admins) {
        await this.notifications.push(
          a.id,
          'tutor_profile_resubmitted',
          'Hồ sơ gia sư đã chỉnh sửa lại',
          'Một hồ sơ bị từ chối đã được cập nhật và chờ duyệt lại.',
          { tutorProfileId: saved.id, userId },
        );
      }
    }
    return saved;
  }

  // ── Subjects (CRUD) ─────────────────────────────────────────────────────
  async addSubject(userId: string, dto: AddSubjectDto) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Tutor profile not found');

    const [subject, level] = await Promise.all([
      this.subjectsRepo.findOne({ where: { id: dto.subjectId, isActive: true } }),
      this.levelsRepo.findOne({ where: { id: dto.levelId, isActive: true } }),
    ]);
    if (!subject) throw new NotFoundException('Subject not found');
    if (!level) throw new NotFoundException('Education level not found');

    const dup = await this.subjectRepo.findOne({
      where: { tutorId: profile.id, subjectId: dto.subjectId, levelId: dto.levelId },
    });
    if (dup) throw new ConflictException('This subject + level combination already exists');

    const ts = this.subjectRepo.create({
      tutorId: profile.id,
      subjectId: dto.subjectId,
      levelId: dto.levelId,
      pricePerHour: dto.pricePerHour,
    });
    return this.subjectRepo.save(ts);
  }

  async listSubjects(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Tutor profile not found');
    return this.subjectRepo.find({
      where: { tutorId: profile.id },
      relations: ['subject', 'level'],
    });
  }

  async updateSubjectPrice(userId: string, tutorSubjectId: string, dto: UpdateSubjectPriceDto) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Tutor profile not found');

    const ts = await this.subjectRepo.findOne({ where: { id: tutorSubjectId } });
    if (!ts || ts.tutorId !== profile.id) throw new NotFoundException('Subject not found');

    ts.pricePerHour = dto.pricePerHour;
    return this.subjectRepo.save(ts);
  }

  async deleteSubject(userId: string, tutorSubjectId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Tutor profile not found');

    const ts = await this.subjectRepo.findOne({ where: { id: tutorSubjectId } });
    if (!ts || ts.tutorId !== profile.id) throw new NotFoundException('Subject not found');

    // Check no active bookings reference this subject+level combo for this tutor
    const activeBooking = await this.bookingRepo.findOne({
      where: {
        tutorId: userId,
        subjectId: ts.subjectId,
        levelId: ts.levelId,
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
      },
    });
    if (activeBooking) {
      throw new ConflictException('Cannot delete: active bookings exist for this subject');
    }

    await this.subjectRepo.delete(ts.id);
    return { message: 'Subject removed' };
  }

  // ── Search ──────────────────────────────────────────────────────────────
  async search(dto: SearchTutorsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;

    const qb = this.profileRepo
      .createQueryBuilder('p')
      .innerJoin('p.user', 'u')
      .leftJoin('tutor_subjects', 'ts', 'ts.tutor_id = p.id')
      .where('p.status = :approved', { approved: TutorStatus.APPROVED })
      .andWhere('u.is_active = true AND u.is_deleted = false');

    if (dto.subjectId) qb.andWhere('ts.subject_id = :sid', { sid: dto.subjectId });
    if (dto.levelId) qb.andWhere('ts.level_id = :lid', { lid: dto.levelId });
    if (dto.minPrice !== undefined) qb.andWhere('ts.price_per_hour >= :minP', { minP: dto.minPrice });
    if (dto.maxPrice !== undefined) qb.andWhere('ts.price_per_hour <= :maxP', { maxP: dto.maxPrice });
    if (dto.minRating !== undefined) qb.andWhere('p.avg_rating >= :minR', { minR: dto.minRating });
    if (dto.mode === 'online') qb.andWhere('p.teaches_online = true');
    if (dto.mode === 'offline') qb.andWhere('p.teaches_offline = true');
    if (dto.mode === 'both') qb.andWhere('p.teaches_online = true AND p.teaches_offline = true');

    if (dto.q) {
      qb.andWhere(
        new Brackets((b) =>
          b
            .where('u.full_name ILIKE :q', { q: `%${dto.q}%` })
            .orWhere(`to_tsvector('simple', coalesce(p.bio,'')) @@ plainto_tsquery('simple', :qFTS)`, { qFTS: dto.q }),
        ),
      );
    }

    qb.select([
      'p.id AS id',
      'p.user_id AS "userId"',
      'p.bio AS bio',
      'p.avg_rating AS "avgRating"',
      'p.total_reviews AS "totalReviews"',
      'p.total_sessions AS "totalSessions"',
      'p.teaches_online AS "teachesOnline"',
      'p.teaches_offline AS "teachesOffline"',
      'u.full_name AS "fullName"',
      'u.avatar_url AS "avatarUrl"',
      'MIN(ts.price_per_hour) AS "minPrice"',
    ]).groupBy('p.id, u.full_name, u.avatar_url');

    switch (dto.sort) {
      case 'price_asc':
        qb.orderBy('MIN(ts.price_per_hour)', 'ASC', 'NULLS LAST');
        break;
      case 'price_desc':
        qb.orderBy('MIN(ts.price_per_hour)', 'DESC', 'NULLS LAST');
        break;
      case 'reviews':
        qb.orderBy('p.total_reviews', 'DESC');
        break;
      case 'newest':
        qb.orderBy('p.created_at', 'DESC');
        break;
      case 'rating':
      default:
        qb.orderBy('p.avg_rating', 'DESC');
    }

    qb.offset((page - 1) * limit).limit(limit);

    const [items, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  // ── Detail ──────────────────────────────────────────────────────────────
  async getDetail(profileId: string) {
    const profile = await this.profileRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.user', 'u')
      .where('p.id = :id', { id: profileId })
      .andWhere('p.status = :s', { s: TutorStatus.APPROVED })
      .getOne();

    if (!profile) throw new NotFoundException('Tutor not found');

    const subjects = await this.subjectRepo.find({
      where: { tutorId: profile.id },
      relations: ['subject', 'level'],
    });

    const recentReviews = await this.reviewRepo.find({
      where: { tutorId: profile.userId, isVisible: true },
      relations: ['student'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const { passwordHash, refreshTokenHash, ...userPublic } = profile.user as any;

    return {
      id: profile.id,
      userId: profile.userId,
      user: userPublic,
      bio: profile.bio,
      videoUrl: profile.videoUrl,
      languages: profile.languages,
      education: profile.education,
      certificates: profile.certificates,
      teachesOnline: profile.teachesOnline,
      teachesOffline: profile.teachesOffline,
      address: profile.address,
      avgRating: profile.avgRating,
      totalReviews: profile.totalReviews,
      totalSessions: profile.totalSessions,
      subjects,
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        tutorReply: r.tutorReply,
        repliedAt: r.repliedAt,
        createdAt: r.createdAt,
        student: r.student
          ? { id: r.student.id, fullName: r.student.fullName, avatarUrl: r.student.avatarUrl }
          : null,
      })),
    };
  }

  // ── Reviews list ────────────────────────────────────────────────────────
  async listReviews(profileId: string, dto: ListReviewsDto) {
    const profile = await this.profileRepo.findOne({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Tutor not found');

    const page = dto.page || 1;
    const limit = dto.limit || 20;

    const qb = this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.student', 's')
      .where('r.tutorId = :tid', { tid: profile.userId })
      .andWhere('r.isVisible = true');

    if (dto.rating) qb.andWhere('r.rating = :rt', { rt: dto.rating });

    qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [reviews, total] = await qb.getManyAndCount();

    return {
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        tutorReply: r.tutorReply,
        repliedAt: r.repliedAt,
        editedAt: r.editedAt,
        createdAt: r.createdAt,
        student: r.student
          ? { id: r.student.id, fullName: r.student.fullName, avatarUrl: r.student.avatarUrl }
          : null,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
