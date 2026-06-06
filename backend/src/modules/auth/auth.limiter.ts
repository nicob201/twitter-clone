import rateLimit from 'express-rate-limit';
import { errorResponse } from '../../shared/response/index.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const registerLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many requests, please try again later'),
});

export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many requests, please try again later'),
});
