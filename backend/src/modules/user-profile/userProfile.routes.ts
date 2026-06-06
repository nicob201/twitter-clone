import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as userProfileController from './userProfile.controller.js';

export const userProfileRouter = Router();

userProfileRouter.get('/:userId', asyncHandler(userProfileController.getProfile));
