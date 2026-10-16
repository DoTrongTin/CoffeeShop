export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  role: 'admin' | 'staff';
}

export interface UserRecord extends AuthUser {
  passwordHash: string;
  isActive: boolean;
}

export interface RefreshTokenRecord {
  id: string;
  userId: number;
  tokenFamily: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface AccessTokenPayload {
  sub: string;
  role: AuthUser['role'];
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  family: string;
  jti: string;
  type: 'refresh';
}