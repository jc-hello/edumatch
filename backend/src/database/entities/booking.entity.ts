import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';
import { AvailabilitySlot } from './availability-slot.entity';
import { Subject } from './subject.entity';
import { EducationLevel } from './education-level.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
@Index('idx_bookings_student_id', ['studentId'])
@Index('idx_bookings_tutor_id', ['tutorId'])
@Index('idx_bookings_status', ['status'])
@Index('idx_bookings_auto_cancel', ['autoCancelAt'], { where: '"status" = \'pending\'' })
@Index('idx_bookings_slot_id', ['slotId'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'uuid', name: 'tutor_id' })
  tutorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;

  @Column({ type: 'uuid', name: 'slot_id' })
  slotId: string;

  @ManyToOne(() => AvailabilitySlot)
  @JoinColumn({ name: 'slot_id' })
  slot: AvailabilitySlot;

  @Column({ type: 'uuid', name: 'subject_id' })
  subjectId: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ type: 'uuid', name: 'level_id' })
  levelId: string;

  @ManyToOne(() => EducationLevel)
  @JoinColumn({ name: 'level_id' })
  level: EducationLevel;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'platform_fee' })
  platformFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'tutor_earning' })
  tutorEarning: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'duration_hours' })
  durationHours: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'timestamptz', name: 'auto_cancel_at' })
  autoCancelAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'cancelled_by' })
  cancelledBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelled_by' })
  cancelledByUser: User;

  @Column({ type: 'text', nullable: true, name: 'cancel_reason' })
  cancelReason: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'cancelled_at' })
  cancelledAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
