import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/index.js';
import { errorResponse } from '../shared/response/index.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json(errorResponse('Internal server error'));
}
