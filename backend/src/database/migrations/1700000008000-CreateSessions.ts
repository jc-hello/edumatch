import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessions1700000008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE session_status AS ENUM ('upcoming', 'ongoing', 'completed')
    `);
    await queryRunner.query(`
      CREATE TABLE sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
        status session_status NOT NULL DEFAULT 'upcoming',
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        reminder_24h_sent BOOLEAN NOT NULL DEFAULT false,
        reminder_1h_sent BOOLEAN NOT NULL DEFAULT false,
        auto_completed_at TIMESTAMPTZ NULL,
        completed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CHECK (end_time > start_time)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_sessions_booking_id ON sessions(booking_id)`);
    await queryRunner.query(`CREATE INDEX idx_sessions_status ON sessions(status)`);
    await queryRunner.query(`CREATE INDEX idx_sessions_start_time ON sessions(start_time) WHERE status IN ('upcoming', 'ongoing')`);
    await queryRunner.query(`CREATE INDEX idx_sessions_reminder ON sessions(start_time, reminder_24h_sent, reminder_1h_sent) WHERE status = 'upcoming'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS sessions`);
    await queryRunner.query(`DROP TYPE IF EXISTS session_status`);
  }
}
