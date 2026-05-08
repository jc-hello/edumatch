import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviews1700000011000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL UNIQUE REFERENCES sessions(id),
        student_id UUID NOT NULL REFERENCES users(id),
        tutor_id UUID NOT NULL REFERENCES users(id),
        rating SMALLINT NOT NULL,
        comment TEXT NULL,
        tutor_reply TEXT NULL,
        replied_at TIMESTAMPTZ NULL,
        is_visible BOOLEAN NOT NULL DEFAULT true,
        edited_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CHECK (rating BETWEEN 1 AND 5)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_reviews_tutor_visible ON reviews(tutor_id) WHERE is_visible = true`);
    await queryRunner.query(`CREATE INDEX idx_reviews_student_id ON reviews(student_id)`);
    await queryRunner.query(`CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reviews`);
  }
}
