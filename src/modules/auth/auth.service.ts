import { randomBytes, randomUUID, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { BadRequestError, UnauthorizedError } from '../../common/errors/app-error.js';
import { authRepository } from './auth.repository.js';
import type { AccessTokenPayload, AuthUser, RefreshTokenPayload, UserRecord } from './auth.types.js';

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

const toAuthUser = (user: UserRecord): AuthUser => ({
  id: user.id,
  username: user.username,
  fullName: user.fullName,
  role: user.role,
});

const getExpiryDate = (seconds: number): Date => new Date(Date.now() + seconds * 1000);

const createAccessToken = (user: AuthUser): string => {
  const payload: AccessTokenPayload = { sub: String(user.id), role: user.role, type: 'access' };
  const options: SignOptions = { expiresIn: env.accessTokenExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwtAccessSecret, options);
};

const createRefreshToken = async (user: AuthUser, tokenFamily = randomBytes(32).toString('hex')) => {
  const payload: RefreshTokenPayload = {
    sub: String(user.id),
    family: tokenFamily,
    jti: randomUUID(),
    type: 'refresh',
  };
  const options: SignOptions = { expiresIn: env.refreshTokenExpiresIn as SignOptions['expiresIn'] };
  const token = jwt.sign(payload, env.jwtRefreshSecret, options);
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded !== 'object' || typeof decoded.exp !== 'number') {
    throw new Error('Unable to determine refresh token expiry');
  }

  const id = await authRepository.saveRefreshToken(
    user.id,
    hashToken(token),
    tokenFamily,
    getExpiryDate(decoded.exp - Math.floor(Date.now() / 1000)),
  );
  return { id, token, tokenFamily };
};

const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const payload = jwt.verify(token, env.jwtRefreshSecret);

    if (
      typeof payload !== 'object' ||
      payload.type !== 'refresh' ||
      typeof payload.sub !== 'string' ||
      typeof payload.family !== 'string' ||
      typeof payload.jti !== 'string'
    ) {
      throw new Error('Invalid refresh token payload');
    }

    return payload as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

export const authService = {
  async login(username: string, password: string) {
    const user = await authRepository.findUserByUsername(username);

    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const authUser = toAuthUser(user);
    const refresh = await createRefreshToken(authUser);

    return {
      user: authUser,
      accessToken: createAccessToken(authUser),
      refreshToken: refresh.token,
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const record = await authRepository.findRefreshTokenByHash(hashToken(refreshToken));
    const userId = Number(payload.sub);

    if (!record) {
      await authRepository.revokeTokenFamily(userId, payload.family);
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (record.revokedAt || record.expiresAt <= new Date()) {
      await authRepository.revokeTokenFamily(record.userId, record.tokenFamily);
      throw new UnauthorizedError('Refresh token has expired or been revoked');
    }

    const user = await authRepository.findUserById(record.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User is inactive or does not exist');
    }

    const authUser = toAuthUser(user);
    const nextRefresh = await createRefreshToken(authUser, record.tokenFamily);
    await authRepository.revokeRefreshToken(record.id, nextRefresh.id);

    return {
      user: authUser,
      accessToken: createAccessToken(authUser),
      refreshToken: nextRefresh.token,
    };
  },

  async logout(refreshToken: string): Promise<void> {
    const record = await authRepository.findRefreshTokenByHash(hashToken(refreshToken));

    if (record && !record.revokedAt) {
      await authRepository.revokeRefreshToken(record.id);
    }
  },

  async getCurrentUser(userId: number): Promise<AuthUser> {
    const user = await authRepository.findUserById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User is inactive or does not exist');
    }

    return toAuthUser(user);
  },
};

export const validateCredentials = (username: unknown, password: unknown): [string, string] => {
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    throw new BadRequestError('username and password are required');
  }

  return [username, password];
};