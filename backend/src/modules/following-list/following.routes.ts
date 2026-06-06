import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as followingController from './following.controller.js';

export const followingRouter = Router();

followingRouter.get('/:userId/following', asyncHandler(followingController.getFollowing));
