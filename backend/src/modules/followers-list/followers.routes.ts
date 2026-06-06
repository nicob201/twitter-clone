import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as followersController from './followers.controller.js';

export const followersRouter = Router();

followersRouter.get('/:userId/followers', asyncHandler(followersController.getFollowers));
