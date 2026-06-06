import { Router } from 'express';
import { requireAuth } from '../../shared/auth/requireAuth.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import { registerLimiter, loginLimiter } from './auth.limiter.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', registerLimiter, asyncHandler(authController.register));
authRouter.post('/login', loginLimiter, asyncHandler(authController.login));
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
