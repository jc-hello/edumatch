import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayments1700000009000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE payment_type AS ENUM ('charge', 'refund')
    `);
    await queryRunner.query(`
      CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed')
    `);
    await queryRunner.query(`
      CREATE TYPE payment_gateway AS ENUM ('vnpay')
    `);
    await queryRunner.query(`
      CREATE TABLE payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id),
        user_id UUID NOT NULL REFERENCES users(id),
        amount DECIMAL(12,2) NOT NULL,
        type payment_type NOT NULL,
        status payment_status NOT NULL DEFAULT 'pending',
        gateway payment_gateway NOT NULL DEFAULT 'vnpay',
        gateway_ref VARCHAR(255) NULL UNIQUE,
        raw_callback JSONB NULL,
        refund_reason TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CHECK (amount > 0)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_payments_booking_id ON payments(booking_id)`);
    await queryRunner.query(`CREATE INDEX idx_payments_user_id ON payments(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_payments_gateway_ref ON payments(gateway_ref) WHERE gateway_ref IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX idx_payments_status_type ON payments(status, type)`);
    await queryRunner.query(`CREATE INDEX idx_payments_created_at ON payments(created_at DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payments`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_type`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_gateway`);
  }
}
