import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavorites1700000013000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE favorites (
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (student_id, tutor_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_favorites_student_id ON favorites(student_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS favorites`);
  }
}
