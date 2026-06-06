import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { AuthPayload } from './auth.types.js';

const JWT_EXPIRES_IN = '7d';
const MIN_SECRET_LENGTH = 32;

function getSecret(): string {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is not set');
  }

  if (env.jwtSecret.length < MIN_SECRET_LENGTH) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  return env.jwtSecret;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, getSecret()) as AuthPayload;
}
