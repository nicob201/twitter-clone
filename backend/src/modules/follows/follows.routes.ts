import { Router } from 'express';
import { requireAuth } from '../../shared/auth/requireAuth.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as followsController from './follows.controller.js';

export const followsRouter = Router();

followsRouter.post('/:userId/follow', requireAuth, asyncHandler(followsController.follow));
followsRouter.delete('/:userId/follow', requireAuth, asyncHandler(followsController.unfollow));
