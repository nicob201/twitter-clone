import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../middleware/errorHandler.js';
import { registerRoutes } from './routes.js';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}
