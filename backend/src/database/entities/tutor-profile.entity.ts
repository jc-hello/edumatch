import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

export enum TutorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Entity('tutor_profiles')
@Index('idx_tutor_profiles_user_id', ['userId'])
@Index('idx_tutor_profiles_status', ['status'])
@Index('idx_tutor_profiles_avg_rating', ['avgRating'])
export class TutorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'video_url' })
  videoUrl: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  languages: string[];

  @Column({ type: 'jsonb', nullable: true })
  education: any;

  @Column({ type: 'jsonb', nullable: true })
  certificates: any;

  @Column({ type: 'enum', enum: TutorStatus, default: TutorStatus.PENDING })
  status: TutorStatus;

  @Column({ type: 'text', nullable: true, name: 'reject_reason' })
  rejectReason: string;

  @Column({ type: 'uuid', nullable: true, name: 'approved_by' })
  approvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedByUser: User;

  @Column({ type: 'timestamptz', nullable: true, name: 'approved_at' })
  approvedAt: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00, name: 'avg_rating' })
  avgRating: number;

  @Column({ type: 'integer', default: 0, name: 'total_reviews' })
  totalReviews: number;

  @Column({ type: 'integer', default: 0, name: 'total_sessions' })
  totalSessions: number;

  @Column({ type: 'boolean', default: true, name: 'teaches_online' })
  teachesOnline: boolean;

  @Column({ type: 'boolean', default: false, name: 'teaches_offline' })
  teachesOffline: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
