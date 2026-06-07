import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import * as userSearchController from './userSearch.controller.js';

export const userSearchRouter = Router();

userSearchRouter.get('/search', asyncHandler(userSearchController.search));
