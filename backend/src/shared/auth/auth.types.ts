import type { Request } from 'express';

export interface AuthPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  userId: string;
}
