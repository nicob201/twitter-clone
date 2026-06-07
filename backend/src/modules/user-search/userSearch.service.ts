import { getPrisma } from '../../shared/db/prisma.js';
import type { SearchData } from './userSearch.types.js';

const SEARCH_LIMIT = 20;

export async function searchUsers(query: string): Promise<SearchData> {
  const prisma = getPrisma();

  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
    },
    take: SEARCH_LIMIT,
  });

  return { data: users };
}
