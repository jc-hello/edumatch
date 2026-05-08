import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilitySlot } from '../../database/entities/availability-slot.entity';
import { TutorProfile } from '../../database/entities/tutor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilitySlot, TutorProfile])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
