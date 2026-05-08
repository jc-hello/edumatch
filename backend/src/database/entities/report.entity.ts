import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ReportTargetType {
  REVIEW = 'review',
  TUTOR = 'tutor',
  BOOKING = 'booking',
}

export enum ReportStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
}

export enum ReportAction {
  REFUND = 'refund',
  FLAG_REVIEW = 'flag_review',
  SUSPEND_TUTOR = 'suspend_tutor',
  DISMISS = 'dismiss',
}

@Entity('reports')
@Index('idx_reports_status', ['status'])
@Index('idx_reports_reporter_id', ['reporterId'])
@Index('idx_reports_target', ['targetType', 'targetId'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'reporter_id' })
  reporterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ type: 'enum', enum: ReportTargetType, name: 'target_type' })
  targetType: ReportTargetType;

  @Column({ type: 'uuid', name: 'target_id' })
  targetId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.OPEN })
  status: ReportStatus;

  @Column({ type: 'uuid', nullable: true, name: 'resolved_by' })
  resolvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by' })
  resolvedByUser: User;

  @Column({ type: 'enum', enum: ReportAction, nullable: true, name: 'action_taken' })
  actionTaken: ReportAction;

  @Column({ type: 'text', nullable: true, name: 'resolution_note' })
  resolutionNote: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'resolved_at' })
  resolvedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
