import { getPrisma } from '../../shared/db/prisma.js';
import { AppError } from '../../shared/errors/index.js';
import type { FollowingData, FollowingUser } from './following.types.js';

export async function getFollowing(userId: string): Promise<FollowingData> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: {
      following: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  const data: FollowingUser[] = follows.map((f) => f.following);

  return { data };
}
