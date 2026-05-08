import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Booking, BookingStatus } from '../../database/entities/booking.entity';
import { AvailabilitySlot } from '../../database/entities/availability-slot.entity';
import { TutorProfile } from '../../database/entities/tutor-profile.entity';
import { TutorSubject } from '../../database/entities/tutor-subject.entity';
import { Session, SessionStatus } from '../../database/entities/session.entity';
import { Payment, PaymentType, PaymentStatus, PaymentGateway } from '../../database/entities/payment.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { SystemConfigService } from '../../common/services/system-config.service';
import { NotificationsService } from '../../common/services/notifications.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(AvailabilitySlot) private slotRepo: Repository<AvailabilitySlot>,
    @InjectRepository(TutorProfile) private profileRepo: Repository<TutorProfile>,
    @InjectRepository(TutorSubject) private tsRepo: Repository<TutorSubject>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
    private systemConfig: SystemConfigService,
    private notifications: NotificationsService,
  ) {}

  // ── CREATE ──────────────────────────────────────────────────────────────
  async create(studentId: string, role: UserRole, dto: CreateBookingDto) {
    if (role === UserRole.TUTOR) {
      throw new ForbiddenException('Tutors cannot book lessons');
    }

    const autoCancelHours = await this.systemConfig.getNumber('booking_auto_cancel_hours', 24);
    const platformFeePercent = await this.systemConfig.getNumber('platform_fee_percent', 10);

    return this.dataSource.transaction(async (mgr) => {
      // Lock the slot row to prevent race conditions
      const slot = await mgr
        .createQueryBuilder(AvailabilitySlot, 's')
        .setLock('pessimistic_write')
        .where('s.id = :id', { id: dto.slotId })
        .getOne();

      if (!slot) throw new NotFoundException('Slot not found');
      if (slot.isBooked) throw new ConflictException('Slot is already booked');
      if (slot.startTime <= new Date()) throw new BadRequestException('Slot already started');

      const profile = await mgr.findOne(TutorProfile, {
        where: { id: slot.tutorId },
      });
      if (!profile) throw new NotFoundException('Tutor profile not found');

      const ts = await mgr.findOne(TutorSubject, {
        where: { tutorId: profile.id, subjectId: dto.subjectId, levelId: dto.levelId },
      });
      if (!ts) {
        throw new BadRequestException('Tutor does not teach this subject + level');
      }

      const durationHours =
        (slot.endTime.getTime() - slot.startTime.getTime()) / 3_600_000;
      const totalAmount = +(Number(ts.pricePerHour) * durationHours).toFixed(2);
      const platformFee = +((totalAmount * platformFeePercent) / 100).toFixed(2);
      const tutorEarning = +(totalAmount - platformFee).toFixed(2);

      // Lock the slot
      slot.isBooked = true;
      await mgr.save(slot);

      const autoCancelAt = new Date(Date.now() + autoCancelHours * 3_600_000);

      const booking = mgr.create(Booking, {
        studentId,
        tutorId: profile.userId,
        slotId: slot.id,
        subjectId: dto.subjectId,
        levelId: dto.levelId,
        totalAmount,
        platformFee,
        tutorEarning,
        durationHours: +durationHours.toFixed(2),
        status: BookingStatus.PENDING,
        autoCancelAt,
      });
      const saved = await mgr.save(booking);

      // Notify tutor
      await this.notifications.push(
        profile.userId,
        'booking_pending',
        'Yêu cầu đặt lịch mới',
        `Bạn có yêu cầu đặt lịch mới — vui lòng xác nhận trong ${autoCancelHours} giờ.`,
        { bookingId: saved.id },
      );

      return saved;
    });
  }

  // ── CONFIRM ─────────────────────────────────────────────────────────────
  async confirm(tutorUserId: string, bookingId: string) {
    return this.dataSource.transaction(async (mgr) => {
      const booking = await mgr
        .createQueryBuilder(Booking, 'b')
        .setLock('pessimistic_write')
        .where('b.id = :id', { id: bookingId })
        .getOne();

      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.tutorId !== tutorUserId) throw new ForbiddenException('Not your booking');
      if (booking.status !== BookingStatus.PENDING) {
        throw new ConflictException(`Cannot confirm booking with status ${booking.status}`);
      }

      const slot = await mgr.findOne(AvailabilitySlot, { where: { id: booking.slotId } });
      if (!slot) throw new NotFoundException('Slot missing');

      booking.status = BookingStatus.CONFIRMED;
      await mgr.save(booking);

      const session = mgr.create(Session, {
        bookingId: booking.id,
        status: SessionStatus.UPCOMING,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      const savedSession = await mgr.save(session);

      // Mock successful charge payment record
      await mgr.save(
        mgr.create(Payment, {
          bookingId: booking.id,
          userId: booking.studentId,
          amount: booking.totalAmount,
          type: PaymentType.CHARGE,
          status: PaymentStatus.SUCCESS,
          gateway: PaymentGateway.VNPAY,
        }),
      );

      await this.notifications.push(
        booking.studentId,
        'booking_confirmed',
        'Đặt lịch đã được xác nhận',
        'Gia sư đã xác nhận buổi học của bạn. Hẹn gặp đúng giờ!',
        { bookingId: booking.id, sessionId: savedSession.id },
      );

      return { booking, session: savedSession };
    });
  }

  // ── REJECT (tutor) ──────────────────────────────────────────────────────
  async reject(tutorUserId: string, bookingId: string, dto: CancelBookingDto) {
    return this.dataSource.transaction(async (mgr) => {
      const booking = await mgr
        .createQueryBuilder(Booking, 'b')
        .setLock('pessimistic_write')
        .where('b.id = :id', { id: bookingId })
        .getOne();
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.tutorId !== tutorUserId) throw new ForbiddenException('Not your booking');
      if (booking.status !== BookingStatus.PENDING) {
        throw new ConflictException(`Cannot reject booking with status ${booking.status}`);
      }

      booking.status = BookingStatus.CANCELLED;
      booking.cancelledBy = tutorUserId;
      booking.cancelReason = dto.reason;
      booking.cancelledAt = new Date();
      await mgr.save(booking);

      // Free slot
      await mgr.update(AvailabilitySlot, booking.slotId, { isBooked: false });

      // Full refund record
      await mgr.save(
        mgr.create(Payment, {
          bookingId: booking.id,
          userId: booking.studentId,
          amount: booking.totalAmount,
          type: PaymentType.REFUND,
          status: PaymentStatus.SUCCESS,
          gateway: PaymentGateway.VNPAY,
          refundReason: 'Tutor rejected booking',
        }),
      );

      await this.notifications.push(
        booking.studentId,
        'booking_rejected',
        'Đặt lịch bị từ chối',
        `Gia sư đã từ chối: ${dto.reason}. Tiền đã được hoàn 100%.`,
        { bookingId: booking.id, refundAmount: booking.totalAmount },
      );

      return booking;
    });
  }

  // ── CANCEL (student or tutor) ───────────────────────────────────────────
  async cancel(userId: string, role: UserRole, bookingId: string, dto: CancelBookingDto) {
    const refundPartialPercent = await this.systemConfig.getNumber('refund_partial_percent', 50);

    return this.dataSource.transaction(async (mgr) => {
      const booking = await mgr
        .createQueryBuilder(Booking, 'b')
        .setLock('pessimistic_write')
        .where('b.id = :id', { id: bookingId })
        .getOne();
      if (!booking) throw new NotFoundException('Booking not found');

      const isParticipant = booking.studentId === userId || booking.tutorId === userId;
      if (!isParticipant && role !== UserRole.ADMIN) {
        throw new ForbiddenException('Not your booking');
      }
      if (![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)) {
        throw new ConflictException(`Cannot cancel booking with status ${booking.status}`);
      }

      const slot = await mgr.findOne(AvailabilitySlot, { where: { id: booking.slotId } });

      // Refund policy: pending → 100%; confirmed → >24h before start = 100%, else partial%
      let refundPct = 100;
      if (booking.status === BookingStatus.CONFIRMED && slot) {
        const hoursUntilStart = (slot.startTime.getTime() - Date.now()) / 3_600_000;
        if (hoursUntilStart <= 24) refundPct = refundPartialPercent;
      }
      const refundAmount = +((Number(booking.totalAmount) * refundPct) / 100).toFixed(2);

      booking.status = BookingStatus.CANCELLED;
      booking.cancelledBy = userId;
      booking.cancelReason = dto.reason;
      booking.cancelledAt = new Date();
      await mgr.save(booking);

      // Free slot if it's still in the future
      if (slot && slot.startTime > new Date()) {
        await mgr.update(AvailabilitySlot, slot.id, { isBooked: false });
      }

      if (refundAmount > 0) {
        await mgr.save(
          mgr.create(Payment, {
            bookingId: booking.id,
            userId: booking.studentId,
            amount: refundAmount,
            type: PaymentType.REFUND,
            status: PaymentStatus.SUCCESS,
            gateway: PaymentGateway.VNPAY,
            refundReason: dto.reason,
          }),
        );
      }

      // Notify the other party
      const notifyUserId = userId === booking.studentId ? booking.tutorId : booking.studentId;
      await this.notifications.push(
        notifyUserId,
        'booking_cancelled',
        'Đặt lịch đã bị hủy',
        `Booking đã bị hủy: ${dto.reason}.`,
        { bookingId: booking.id, refundAmount, refundPercent: refundPct },
      );

      return { booking, refundAmount, refundPercent: refundPct };
    });
  }

  // ── Cron task: auto-cancel expired pending bookings ─────────────────────
  async autoCancelExpired() {
    const expired = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.status = :s', { s: BookingStatus.PENDING })
      .andWhere('b.auto_cancel_at <= NOW()')
      .getMany();

    if (!expired.length) return { cancelled: 0 };

    let cancelledCount = 0;
    for (const booking of expired) {
      try {
        await this.dataSource.transaction(async (mgr) => {
          // Re-lock and re-check
          const fresh = await mgr
            .createQueryBuilder(Booking, 'b')
            .setLock('pessimistic_write')
            .where('b.id = :id', { id: booking.id })
            .getOne();
          if (!fresh || fresh.status !== BookingStatus.PENDING) return;

          fresh.status = BookingStatus.CANCELLED;
          fresh.cancelledBy = null;
          fresh.cancelReason = 'Auto-cancelled: tutor did not respond in time';
          fresh.cancelledAt = new Date();
          await mgr.save(fresh);

          await mgr.update(AvailabilitySlot, fresh.slotId, { isBooked: false });

          await mgr.save(
            mgr.create(Payment, {
              bookingId: fresh.id,
              userId: fresh.studentId,
              amount: fresh.totalAmount,
              type: PaymentType.REFUND,
              status: PaymentStatus.SUCCESS,
              gateway: PaymentGateway.VNPAY,
              refundReason: 'Auto-cancelled (tutor timeout)',
            }),
          );

          cancelledCount++;
        });

        await this.notifications.push(
          booking.studentId,
          'booking_auto_cancelled',
          'Đặt lịch tự động hủy',
          'Gia sư không phản hồi đúng hạn. Tiền đã được hoàn 100%.',
          { bookingId: booking.id },
        );
        await this.notifications.push(
          booking.tutorId,
          'booking_auto_cancelled',
          'Đặt lịch tự động hủy',
          'Bạn không xác nhận booking đúng hạn. Booking đã được hủy.',
          { bookingId: booking.id },
        );
      } catch (e: any) {
        this.logger.error(`Failed to auto-cancel booking ${booking.id}: ${e.message}`);
      }
    }

    this.logger.log(`Auto-cancelled ${cancelledCount} bookings`);
    return { cancelled: cancelledCount };
  }

  // ── List user bookings ──────────────────────────────────────────────────
  async listForUser(userId: string, role: 'student' | 'tutor') {
    const where = role === 'student' ? { studentId: userId } : { tutorId: userId };
    return this.bookingRepo.find({
      where,
      relations: ['slot', 'subject', 'level'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getDetail(userId: string, role: UserRole, bookingId: string) {
    const b = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['slot', 'subject', 'level', 'student', 'tutor'],
    });
    if (!b) throw new NotFoundException('Booking not found');

    const isParticipant = b.studentId === userId || b.tutorId === userId;
    if (!isParticipant && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not your booking');
    }
    return b;
  }
}
