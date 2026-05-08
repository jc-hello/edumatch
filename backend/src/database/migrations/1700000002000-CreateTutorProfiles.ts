import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTutorProfiles1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE tutor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended')
    `);
    await queryRunner.query(`
      CREATE TABLE tutor_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT NULL,
        video_url VARCHAR(500) NULL,
        languages VARCHAR(10)[] NULL,
        education JSONB NULL,
        certificates JSONB NULL,
        status tutor_status NOT NULL DEFAULT 'pending',
        reject_reason TEXT NULL,
        approved_by UUID NULL REFERENCES users(id),
        approved_at TIMESTAMPTZ NULL,
        avg_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
        total_reviews INTEGER NOT NULL DEFAULT 0,
        total_sessions INTEGER NOT NULL DEFAULT 0,
        teaches_online BOOLEAN NOT NULL DEFAULT true,
        teaches_offline BOOLEAN NOT NULL DEFAULT false,
        address VARCHAR(500) NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_tutor_profiles_user_id ON tutor_profiles(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_tutor_profiles_status ON tutor_profiles(status)`);
    await queryRunner.query(`CREATE INDEX idx_tutor_profiles_avg_rating ON tutor_profiles(avg_rating DESC)`);
    await queryRunner.query(`CREATE INDEX idx_tutor_profiles_bio_fts ON tutor_profiles USING GIN(to_tsvector('simple', coalesce(bio,'')))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tutor_profiles`);
    await queryRunner.query(`DROP TYPE IF EXISTS tutor_status`);
  }
}
