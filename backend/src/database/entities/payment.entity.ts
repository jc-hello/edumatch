import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Booking } from './booking.entity';
import { User } from './user.entity';

export enum PaymentType {
  CHARGE = 'charge',
  REFUND = 'refund',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum PaymentGateway {
  VNPAY = 'vnpay',
}

@Entity('payments')
@Index('idx_payments_booking_id', ['bookingId'])
@Index('idx_payments_user_id', ['userId'])
@Index('idx_payments_gateway_ref', ['gatewayRef'], { where: '"gateway_ref" IS NOT NULL' })
@Index('idx_payments_status_type', ['status', 'type'])
@Index('idx_payments_created_at', ['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentGateway, default: PaymentGateway.VNPAY })
  gateway: PaymentGateway;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true, name: 'gateway_ref' })
  gatewayRef: string;

  @Column({ type: 'jsonb', nullable: true, name: 'raw_callback' })
  rawCallback: any;

  @Column({ type: 'text', nullable: true, name: 'refund_reason' })
  refundReason: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
