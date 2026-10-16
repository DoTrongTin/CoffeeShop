import { database } from '../../config/database.js';
import type { RefreshTokenRecord, UserRecord } from './auth.types.js';

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
}

interface RefreshTokenRow {
  id: string;
  user_id: number;
  token_family: string;
  expires_at: Date;
  revoked_at: Date | null;
}

const mapUser = (row: UserRow): UserRecord => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  fullName: row.full_name,
  role: row.role,
  isActive: row.is_active,
});

const mapRefreshToken = (row: RefreshTokenRow): RefreshTokenRecord => ({
  id: row.id,
  userId: row.user_id,
  tokenFamily: row.token_family,
  expiresAt: row.expires_at,
  revokedAt: row.revoked_at,
});

export const authRepository = {
  async findUserByUsername(username: string): Promise<UserRecord | null> {
    const result = await database.query<UserRow>(
      `SELECT id, username, password_hash, full_name, role, is_active
       FROM users WHERE username = $1 LIMIT 1`,
      [username],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  async findUserById(id: number): Promise<UserRecord | null> {
    const result = await database.query<UserRow>(
      `SELECT id, username, password_hash, full_name, role, is_active
       FROM users WHERE id = $1 LIMIT 1`,
      [id],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const result = await database.query<RefreshTokenRow>(
      `SELECT id, user_id, token_family, expires_at, revoked_at
       FROM refresh_tokens WHERE token_hash = $1 LIMIT 1`,
      [tokenHash],
    );

    return result.rows[0] ? mapRefreshToken(result.rows[0]) : null;
  },

  async saveRefreshToken(
    userId: number,
    tokenHash: string,
    tokenFamily: string,
    expiresAt: Date,
  ): Promise<string> {
    const result = await database.query<{ id: string }>(
      `INSERT INTO refresh_tokens (user_id, token_hash, token_family, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, tokenHash, tokenFamily, expiresAt],
    );

    return result.rows[0].id;
  },

  async revokeRefreshToken(id: string, replacedByTokenId?: string): Promise<void> {
    await database.query(
      `UPDATE refresh_tokens
       SET revoked_at = COALESCE(revoked_at, NOW()), replaced_by_token_id = $2
       WHERE id = $1`,
      [id, replacedByTokenId ?? null],
    );
  },

  async revokeTokenFamily(userId: number, tokenFamily: string): Promise<void> {
    await database.query(
      `UPDATE refresh_tokens
       SET revoked_at = COALESCE(revoked_at, NOW())
       WHERE user_id = $1 AND token_family = $2 AND revoked_at IS NULL`,
      [userId, tokenFamily],
    );
  },
};