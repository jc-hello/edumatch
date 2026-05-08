import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { TutorProfile } from './tutor-profile.entity';

@Entity('availability_slots')
@Index('idx_availability_tutor_time', ['tutorId', 'startTime', 'endTime'])
@Index('idx_availability_tutor_unbooked', ['tutorId', 'isBooked'], { where: '"is_booked" = false' })
@Index('idx_availability_recurring_group', ['recurringGroupId'], { where: '"recurring_group_id" IS NOT NULL' })
export class AvailabilitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tutor_id' })
  tutorId: string;

  @ManyToOne(() => TutorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutor_id' })
  tutor: TutorProfile;

  @Column({ type: 'timestamptz', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'timestamptz', name: 'end_time' })
  endTime: Date;

  @Column({ type: 'boolean', default: false, name: 'is_booked' })
  isBooked: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_recurring' })
  isRecurring: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'recurring_group_id' })
  recurringGroupId: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
