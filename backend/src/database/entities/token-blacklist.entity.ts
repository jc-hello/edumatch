import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('token_blacklist')
@Index('idx_token_blacklist_expires_at', ['expiresAt'])
export class TokenBlacklist {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  jti: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;
}
