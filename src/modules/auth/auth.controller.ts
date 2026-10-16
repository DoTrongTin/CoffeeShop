import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import { authService, validateCredentials } from './auth.service.js';

export const login = async (request: Request, response: Response) => {
  const [username, password] = validateCredentials(request.body?.username, request.body?.password);
  response.json(await authService.login(username, password));
};

export const refresh = async (request: Request, response: Response) => {
  const refreshToken = request.body?.refreshToken;

  if (typeof refreshToken !== 'string' || !refreshToken) {
    throw new UnauthorizedError('refreshToken is required');
  }

  response.json(await authService.refresh(refreshToken));
};

export const logout = async (request: Request, response: Response) => {
  const refreshToken = request.body?.refreshToken;

  if (typeof refreshToken === 'string' && refreshToken) {
    await authService.logout(refreshToken);
  }

  response.status(204).send();
};

export const me = async (_request: Request, response: Response) => {
  const userId = Number(response.locals.auth?.sub);

  if (!Number.isInteger(userId)) {
    throw new UnauthorizedError('Invalid access token subject');
  }

  response.json({ user: await authService.getCurrentUser(userId) });
};