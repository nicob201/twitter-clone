import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.types.js';
import { verifyToken } from './jwt.js';
import { AppError } from '../errors/index.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.slice(7);

  try {
    const payload = verifyToken(token);
    (req as AuthenticatedRequest).userId = payload.userId;
    next();
  } catch {
    throw new AppError('Authentication required', 401);
  }
}
