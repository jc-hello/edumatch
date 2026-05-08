import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAvailabilitySlots1700000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE availability_slots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        is_booked BOOLEAN NOT NULL DEFAULT false,
        is_recurring BOOLEAN NOT NULL DEFAULT false,
        recurring_group_id UUID NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CHECK (end_time > start_time),
        CHECK (EXTRACT(EPOCH FROM (end_time - start_time))/3600 <= 8)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_availability_tutor_time ON availability_slots(tutor_id, start_time, end_time)`);
    await queryRunner.query(`CREATE INDEX idx_availability_tutor_unbooked ON availability_slots(tutor_id, is_booked) WHERE is_booked = false`);
    await queryRunner.query(`CREATE INDEX idx_availability_recurring_group ON availability_slots(recurring_group_id) WHERE recurring_group_id IS NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS availability_slots`);
  }
}
