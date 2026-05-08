import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubjects1700000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true
      )
    `);
    await queryRunner.query(`
      INSERT INTO subjects (name, slug) VALUES
        ('Toán', 'toan'),
        ('Vật lý', 'vat-ly'),
        ('Hóa học', 'hoa-hoc'),
        ('Sinh học', 'sinh-hoc'),
        ('Ngữ văn', 'ngu-van'),
        ('Tiếng Anh', 'tieng-anh'),
        ('Tiếng Nhật', 'tieng-nhat'),
        ('Tiếng Trung', 'tieng-trung'),
        ('Lịch sử', 'lich-su'),
        ('Địa lý', 'dia-ly'),
        ('Tin học', 'tin-hoc'),
        ('Lập trình', 'lap-trinh'),
        ('IELTS', 'ielts'),
        ('TOEIC', 'toeic')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS subjects`);
  }
}
