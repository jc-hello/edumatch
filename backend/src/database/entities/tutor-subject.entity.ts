import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique, Check,
} from 'typeorm';
import { TutorProfile } from './tutor-profile.entity';
import { Subject } from './subject.entity';
import { EducationLevel } from './education-level.entity';

@Entity('tutor_subjects')
@Unique(['tutorId', 'subjectId', 'levelId'])
@Index('idx_tutor_subjects_tutor_id', ['tutorId'])
@Index('idx_tutor_subjects_subject_level', ['subjectId', 'levelId'])
@Index('idx_tutor_subjects_price', ['pricePerHour'])
export class TutorSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tutor_id' })
  tutorId: string;

  @ManyToOne(() => TutorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutor_id' })
  tutor: TutorProfile;

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

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'price_per_hour' })
  pricePerHour: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
