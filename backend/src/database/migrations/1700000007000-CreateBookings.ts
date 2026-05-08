import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookings1700000007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed')
    `);
    await queryRunner.query(`
      CREATE TABLE bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id),
        tutor_id UUID NOT NULL REFERENCES users(id),
        slot_id UUID NOT NULL REFERENCES availability_slots(id),
        subject_id UUID NOT NULL REFERENCES subjects(id),
        level_id UUID NOT NULL REFERENCES education_levels(id),
        total_amount DECIMAL(12,2) NOT NULL,
        platform_fee DECIMAL(12,2) NOT NULL,
        tutor_earning DECIMAL(12,2) NOT NULL,
        duration_hours DECIMAL(4,2) NOT NULL,
        status booking_status NOT NULL DEFAULT 'pending',
        auto_cancel_at TIMESTAMPTZ NOT NULL,
        cancelled_by UUID NULL REFERENCES users(id),
        cancel_reason TEXT NULL,
        cancelled_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CHECK (total_amount > 0),
        CHECK (platform_fee >= 0),
        CHECK (tutor_earning = total_amount - platform_fee),
        CHECK (duration_hours > 0)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_bookings_student_id ON bookings(student_id)`);
    await queryRunner.query(`CREATE INDEX idx_bookings_tutor_id ON bookings(tutor_id)`);
    await queryRunner.query(`CREATE INDEX idx_bookings_status ON bookings(status)`);
    await queryRunner.query(`CREATE INDEX idx_bookings_auto_cancel ON bookings(auto_cancel_at) WHERE status = 'pending'`);
    await queryRunner.query(`CREATE INDEX idx_bookings_slot_id ON bookings(slot_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS bookings`);
    await queryRunner.query(`DROP TYPE IF EXISTS booking_status`);
  }
}
