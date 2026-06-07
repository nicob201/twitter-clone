import { Router } from 'express';
import { requireAuth } from '../../shared/auth/requireAuth.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as userProfileController from './userProfile.controller.js';

export const userProfileRouter = Router();

userProfileRouter.get('/:userId', requireAuth, asyncHandler(userProfileController.getProfile));
