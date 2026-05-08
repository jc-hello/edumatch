import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEducationLevels1700000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE education_levels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true
      )
    `);
    await queryRunner.query(`
      INSERT INTO education_levels (sort_order, name, slug) VALUES
        (1, 'Tiểu học', 'tieu-hoc'),
        (2, 'THCS', 'thcs'),
        (3, 'THPT', 'thpt'),
        (4, 'Đại học', 'dai-hoc'),
        (5, 'Người đi làm', 'nguoi-di-lam'),
        (6, 'Luyện thi IELTS', 'luyen-thi-ielts'),
        (7, 'Luyện thi TOEIC', 'luyen-thi-toeic')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS education_levels`);
  }
}
