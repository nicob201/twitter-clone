import { Router } from 'express';
import { requireAuth } from '../../shared/auth/requireAuth.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as timelineController from './timeline.controller.js';

export const timelineRouter = Router();

timelineRouter.get('/', requireAuth, asyncHandler(timelineController.getTimeline));
