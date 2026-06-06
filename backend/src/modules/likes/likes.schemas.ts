import { z } from 'zod';

export const tweetIdParamSchema = z.object({
  tweetId: z.string().min(1, 'Tweet ID is required'),
});
