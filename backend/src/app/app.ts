import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '../config/env.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { registerRoutes } from './routes.js';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.frontendUrl }));
  app.use(express.json());

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}
