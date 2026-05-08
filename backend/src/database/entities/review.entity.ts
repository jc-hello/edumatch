import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Session } from './session.entity';
import { User } from './user.entity';

@Entity('reviews')
@Index('idx_reviews_tutor_visible', ['tutorId'], { where: '"is_visible" = true' })
@Index('idx_reviews_student_id', ['studentId'])
@Index('idx_reviews_created_at', ['createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'session_id', unique: true })
  sessionId: string;

  @OneToOne(() => Session)
  @JoinColumn({ name: 'session_id' })
  session: Session;

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

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'text', nullable: true, name: 'tutor_reply' })
  tutorReply: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'replied_at' })
  repliedAt: Date;

  @Column({ type: 'boolean', default: true, name: 'is_visible' })
  isVisible: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'edited_at' })
  editedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
