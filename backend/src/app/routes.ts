import type { Application } from 'express';
import { healthRouter } from '../modules/health/index.js';

export function registerRoutes(app: Application): void {
  app.use('/health', healthRouter);
}
