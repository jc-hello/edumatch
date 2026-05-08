import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemConfigs1700000017000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE system_configs (
        key VARCHAR(100) PRIMARY KEY,
        value VARCHAR(500) NOT NULL,
        description VARCHAR(500) NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      INSERT INTO system_configs (key, value, description) VALUES
        ('booking_auto_cancel_hours', '24', 'Số giờ để gia sư xác nhận trước khi tự hủy'),
        ('platform_fee_percent', '10', '% phí platform trên mỗi booking'),
        ('payout_delay_days', '3', 'Số ngày giữ tiền sau session hoàn thành'),
        ('refund_partial_percent', '50', '% hoàn tiền khi hủy trong vòng 24h'),
        ('min_payout_amount', '100000', 'Số tiền rút tối thiểu (VND)'),
        ('max_slot_duration_hours', '8', 'Số giờ tối đa mỗi slot')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS system_configs`);
  }
}
