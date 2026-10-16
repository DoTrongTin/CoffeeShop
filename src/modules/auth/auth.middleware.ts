import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import type { AccessTokenPayload } from './auth.types.js';

export const requireAuth = (request: Request, _response: Response, next: NextFunction): void => {
  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

  if (!token) {
    next(new UnauthorizedError('Bearer token is required'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);

    if (typeof payload !== 'object' || payload.type !== 'access' || typeof payload.sub !== 'string') {
      throw new Error('Invalid access token payload');
    }

    _response.locals.auth = payload as AccessTokenPayload;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};