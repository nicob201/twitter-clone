import { Router } from 'express';
import { requireAuth } from '../../shared/auth/requireAuth.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as likesController from './likes.controller.js';

export const likesRouter = Router();

likesRouter.post('/:tweetId/like', requireAuth, asyncHandler(likesController.like));
likesRouter.delete('/:tweetId/like', requireAuth, asyncHandler(likesController.unlike));
