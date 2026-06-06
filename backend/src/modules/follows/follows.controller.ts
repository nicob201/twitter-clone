import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';
import { userIdParamSchema } from './follows.schemas.js';
import * as followsService from './follows.service.js';

export async function follow(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { userId } = userIdParamSchema.parse(req.params);

    await followsService.followUser(authReq.userId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function unfollow(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { userId } = userIdParamSchema.parse(req.params);

    await followsService.unfollowUser(authReq.userId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
