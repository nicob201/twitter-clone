import type { Request, Response, NextFunction } from 'express';
import { userIdParamSchema } from '../../shared/schemas/params.js';
import * as followingService from './following.service.js';
import { successResponse } from '../../shared/response/index.js';

export async function getFollowing(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const { userId } = userIdParamSchema.parse(req.params);
  const result = await followingService.getFollowing(userId);
  res.json(successResponse(result));
}
