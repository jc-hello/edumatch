import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
@Index('idx_audit_logs_admin_id', ['adminId'])
@Index('idx_audit_logs_action', ['action'])
@Index('idx_audit_logs_target', ['targetType', 'targetId'])
@Index('idx_audit_logs_created_at', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'admin_id' })
  adminId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 50, name: 'target_type' })
  targetType: string;

  @Column({ type: 'uuid', name: 'target_id' })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true, name: 'before_data' })
  beforeData: any;

  @Column({ type: 'jsonb', nullable: true, name: 'after_data' })
  afterData: any;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
