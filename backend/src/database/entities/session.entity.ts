import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn, Index,
} from 'typeorm';
import { Booking } from './booking.entity';

export enum SessionStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
}

@Entity('sessions')
@Index('idx_sessions_booking_id', ['bookingId'])
@Index('idx_sessions_status', ['status'])
@Index('idx_sessions_start_time', ['startTime'], { where: '"status" IN (\'upcoming\', \'ongoing\')' })
@Index('idx_sessions_reminder', ['startTime', 'reminder24hSent', 'reminder1hSent'], { where: '"status" = \'upcoming\'' })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'booking_id', unique: true })
  bookingId: string;

  @OneToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.UPCOMING })
  status: SessionStatus;

  @Column({ type: 'timestamptz', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'timestamptz', name: 'end_time' })
  endTime: Date;

  @Column({ type: 'boolean', default: false, name: 'reminder_24h_sent' })
  reminder24hSent: boolean;

  @Column({ type: 'boolean', default: false, name: 'reminder_1h_sent' })
  reminder1hSent: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'auto_completed_at' })
  autoCompletedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'completed_at' })
  completedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
