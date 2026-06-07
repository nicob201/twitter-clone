import { z } from 'zod';

export const userIdParamSchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(36, 'User ID is too long'),
});
