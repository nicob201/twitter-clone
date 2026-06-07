import type { Request, Response, NextFunction } from 'express';
import { searchQuerySchema } from './userSearch.schemas.js';
import * as userSearchService from './userSearch.service.js';
import { successResponse } from '../../shared/response/index.js';

export async function search(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const { q } = searchQuerySchema.parse(req.query);
  const result = await userSearchService.searchUsers(q);
  res.json(successResponse(result));
}
