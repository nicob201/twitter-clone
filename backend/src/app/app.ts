import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { registerRoutes } from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): express.Application {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.frontendUrl }));
  app.use('/uploads', express.static(path.resolve(__dirname, '../..', 'uploads')));
  app.use(express.json());

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}
