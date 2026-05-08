import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTutorSubjects1700000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tutor_subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
        subject_id UUID NOT NULL REFERENCES subjects(id),
        level_id UUID NOT NULL REFERENCES education_levels(id),
        price_per_hour DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (tutor_id, subject_id, level_id),
        CHECK (price_per_hour > 0)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_tutor_subjects_tutor_id ON tutor_subjects(tutor_id)`);
    await queryRunner.query(`CREATE INDEX idx_tutor_subjects_subject_level ON tutor_subjects(subject_id, level_id)`);
    await queryRunner.query(`CREATE INDEX idx_tutor_subjects_price ON tutor_subjects(price_per_hour)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tutor_subjects`);
  }
}
