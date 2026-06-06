import type { Request, Response, NextFunction } from 'express';
import { userIdParamSchema } from './userProfile.schemas.js';
import * as userProfileService from './userProfile.service.js';
import { successResponse } from '../../shared/response/index.js';

export async function getProfile(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const { userId } = userIdParamSchema.parse(req.params);
  const profile = await userProfileService.getProfile(userId);
  res.json(successResponse(profile));
}
