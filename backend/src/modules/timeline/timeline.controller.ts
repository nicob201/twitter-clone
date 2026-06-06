import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';
import { timelineQuerySchema } from './timeline.schemas.js';
import * as timelineService from './timeline.service.js';
import { successResponse } from '../../shared/response/index.js';

export async function getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const query = timelineQuerySchema.parse(req.query);
    const result = await timelineService.getTimeline(authReq.userId, query.page, query.limit);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}
