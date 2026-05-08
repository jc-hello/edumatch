import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';
import { TutorProfile } from '../../database/entities/tutor-profile.entity';
import { TutorSubject } from '../../database/entities/tutor-subject.entity';
import { Subject } from '../../database/entities/subject.entity';
import { EducationLevel } from '../../database/entities/education-level.entity';
import { Booking } from '../../database/entities/booking.entity';
import { Review } from '../../database/entities/review.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TutorProfile,
      TutorSubject,
      Subject,
      EducationLevel,
      Booking,
      Review,
      User,
    ]),
  ],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
