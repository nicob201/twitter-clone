import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';
import { createTweetSchema } from './tweets.schemas.js';
import * as tweetsService from './tweets.service.js';
import { successResponse, errorResponse } from '../../shared/response/index.js';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const input = createTweetSchema.parse(req.body);
    const tweet = await tweetsService.createTweet(input, authReq.userId);
    res.status(201).json(successResponse(tweet));
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id;

    if (!id) {
      res.status(404).json(errorResponse('Tweet not found'));
      return;
    }

    await tweetsService.deleteTweet(id, authReq.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
