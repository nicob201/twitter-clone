import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, 'Query must be at least 2 characters')
    .max(50, 'Query must be at most 50 characters'),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
