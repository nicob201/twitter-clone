import type { Application } from 'express';
import { healthRouter } from '../modules/health/index.js';
import { authRouter } from '../modules/auth/index.js';
import { tweetsRouter } from '../modules/tweets/index.js';

export function registerRoutes(app: Application): void {
  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/tweets', tweetsRouter);
}
