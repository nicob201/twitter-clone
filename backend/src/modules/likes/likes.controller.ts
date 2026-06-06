import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';
import { tweetIdParamSchema } from './likes.schemas.js';
import * as likesService from './likes.service.js';

export async function like(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { tweetId } = tweetIdParamSchema.parse(req.params);

    await likesService.likeTweet(authReq.userId, tweetId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function unlike(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { tweetId } = tweetIdParamSchema.parse(req.params);

    await likesService.unlikeTweet(authReq.userId, tweetId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
