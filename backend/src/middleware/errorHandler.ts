import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/index.js';
import { errorResponse } from '../shared/response/index.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const message = err.errors[0]?.message ?? 'Validation error';
    res.status(400).json(errorResponse(message));
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json(errorResponse(err.message));
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  if (err.message === 'Only JPEG, PNG, and WebP images are allowed') {
    res.status(400).json(errorResponse(err.message));
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json(errorResponse('Internal server error'));
}
