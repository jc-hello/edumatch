import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsCron } from './bookings.cron';
import { Booking } from '../../database/entities/booking.entity';
import { AvailabilitySlot } from '../../database/entities/availability-slot.entity';
import { TutorProfile } from '../../database/entities/tutor-profile.entity';
import { TutorSubject } from '../../database/entities/tutor-subject.entity';
import { Session } from '../../database/entities/session.entity';
import { Payment } from '../../database/entities/payment.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      AvailabilitySlot,
      TutorProfile,
      TutorSubject,
      Session,
      Payment,
      User,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsCron],
  exports: [BookingsService],
})
export class BookingsModule {}
