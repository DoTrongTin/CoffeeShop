import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/async-handler.js';
import { requireAuth } from './auth.middleware.js';
import { login, logout, me, refresh } from './auth.controller.js';

const authRoutes = Router();

authRoutes.post('/login', asyncHandler(login));
authRoutes.post('/refresh', asyncHandler(refresh));
authRoutes.post('/logout', asyncHandler(logout));
authRoutes.get('/me', requireAuth, asyncHandler(me));

export default authRoutes;