import { getPrisma } from '../../shared/db/prisma.js';
import { AppError } from '../../shared/errors/index.js';
import { isFollowing } from '../follows/follows.service.js';
import type { UserProfileResponse } from './userProfile.types.js';

export async function getProfile(
  userId: string,
  currentUserId: string,
): Promise<UserProfileResponse> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      createdAt: true,
      bio: true,
      avatarUrl: true,
      _count: {
        select: {
          tweets: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isFollowedByCurrentUser = await isFollowing(currentUserId, userId);

  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    tweetsCount: user._count.tweets,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    isFollowedByCurrentUser,
  };
}
