import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1700000015000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id UUID NOT NULL,
        before_data JSONB NULL,
        after_data JSONB NULL,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_action ON audit_logs(action)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
  }
}
