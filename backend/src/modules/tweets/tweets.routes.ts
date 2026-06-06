import { Router } from 'express';
import { requireAuth } from '../../shared/auth/requireAuth.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as tweetsController from './tweets.controller.js';

export const tweetsRouter = Router();

tweetsRouter.post('/', requireAuth, asyncHandler(tweetsController.create));
tweetsRouter.delete('/:id', requireAuth, asyncHandler(tweetsController.remove));
