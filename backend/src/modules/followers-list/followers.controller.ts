import type { Request, Response, NextFunction } from 'express';
import { userIdParamSchema } from '../../shared/schemas/params.js';
import * as followersService from './followers.service.js';
import { successResponse } from '../../shared/response/index.js';

export async function getFollowers(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const { userId } = userIdParamSchema.parse(req.params);
  const result = await followersService.getFollowers(userId);
  res.json(successResponse(result));
}
