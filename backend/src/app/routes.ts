import type { Application } from 'express';
import { healthRouter } from '../modules/health/index.js';
import { authRouter } from '../modules/auth/index.js';
import { tweetsRouter } from '../modules/tweets/index.js';
import { followsRouter } from '../modules/follows/index.js';
import { likesRouter } from '../modules/likes/index.js';
import { timelineRouter } from '../modules/timeline/index.js';
import { userProfileRouter } from '../modules/user-profile/index.js';
import { followersRouter } from '../modules/followers-list/index.js';
import { followingRouter } from '../modules/following-list/index.js';
import { userSearchRouter } from '../modules/user-search/index.js';

export function registerRoutes(app: Application): void {
  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/tweets', tweetsRouter);
  app.use('/api/users', followsRouter);
  app.use('/api/tweets', likesRouter);
  app.use('/api/timeline', timelineRouter);
  app.use('/api/users', userSearchRouter);
  app.use('/api/users', userProfileRouter);
  app.use('/api/users', followersRouter);
  app.use('/api/users', followingRouter);
}
