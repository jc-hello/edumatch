import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayouts1700000010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed')
    `);
    await queryRunner.query(`
      CREATE TABLE payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tutor_id UUID NOT NULL REFERENCES users(id),
        amount DECIMAL(12,2) NOT NULL,
        status payout_status NOT NULL DEFAULT 'pending',
        bank_info JSONB NOT NULL,
        note TEXT NULL,
        failure_reason TEXT NULL,
        requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        processed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CHECK (amount > 0)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_payouts_tutor_id ON payouts(tutor_id)`);
    await queryRunner.query(`CREATE INDEX idx_payouts_status ON payouts(status)`);
    await queryRunner.query(`CREATE INDEX idx_payouts_requested_at ON payouts(requested_at DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payouts`);
    await queryRunner.query(`DROP TYPE IF EXISTS payout_status`);
  }
}
