import { z } from 'zod';

export const createTweetSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(280, 'Content must be at most 280 characters')
    .transform((v) => v.trim()),
});

export type CreateTweetInput = z.infer<typeof createTweetSchema>;
