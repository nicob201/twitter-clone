import { getPrisma } from '../../shared/db/prisma.js';
import { AppError } from '../../shared/errors/index.js';
import type { FollowersData, FollowerUser } from './followers.types.js';

export async function getFollowers(userId: string): Promise<FollowersData> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    select: {
      follower: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  const data: FollowerUser[] = follows.map((f) => f.follower);

  return { data };
}
