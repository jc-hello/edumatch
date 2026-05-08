import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReports1700000014000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE report_target_type AS ENUM ('review', 'tutor', 'booking')
    `);
    await queryRunner.query(`
      CREATE TYPE report_status AS ENUM ('open', 'resolved')
    `);
    await queryRunner.query(`
      CREATE TYPE report_action AS ENUM ('refund', 'flag_review', 'suspend_tutor', 'dismiss')
    `);
    await queryRunner.query(`
      CREATE TABLE reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id UUID NOT NULL REFERENCES users(id),
        target_type report_target_type NOT NULL,
        target_id UUID NOT NULL,
        reason TEXT NOT NULL,
        status report_status NOT NULL DEFAULT 'open',
        resolved_by UUID NULL REFERENCES users(id),
        action_taken report_action NULL,
        resolution_note TEXT NULL,
        resolved_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_reports_status ON reports(status)`);
    await queryRunner.query(`CREATE INDEX idx_reports_reporter_id ON reports(reporter_id)`);
    await queryRunner.query(`CREATE INDEX idx_reports_target ON reports(target_type, target_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reports`);
    await queryRunner.query(`DROP TYPE IF EXISTS report_action`);
    await queryRunner.query(`DROP TYPE IF EXISTS report_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS report_target_type`);
  }
}
