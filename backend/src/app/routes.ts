import type { Application } from 'express';
import { healthRouter } from '../modules/health/index.js';
import { authRouter } from '../modules/auth/index.js';
import { tweetsRouter } from '../modules/tweets/index.js';
import { followsRouter } from '../modules/follows/index.js';
import { likesRouter } from '../modules/likes/index.js';

export function registerRoutes(app: Application): void {
  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/tweets', tweetsRouter);
  app.use('/api/users', followsRouter);
  app.use('/api/tweets', likesRouter);
}
