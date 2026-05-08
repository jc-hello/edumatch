import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTokenBlacklist1700000016000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE token_blacklist (
        jti VARCHAR(255) PRIMARY KEY,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS token_blacklist`);
  }
}
