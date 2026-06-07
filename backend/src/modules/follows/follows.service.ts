import { Prisma } from '@prisma/client';
import { getPrisma } from '../../shared/db/prisma.js';
import { AppError } from '../../shared/errors/index.js';

function isSelfFollow(followerId: string, followingId: string): boolean {
  return followerId === followingId;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  if (isSelfFollow(followerId, followingId)) {
    return false;
  }

  const prisma = getPrisma();

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  return !!follow;
}

export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (isSelfFollow(followerId, followingId)) {
    throw new AppError('Cannot follow yourself', 400);
  }

  const prisma = getPrisma();

  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true },
  });

  if (!targetUser) {
    throw new AppError('User not found', 404);
  }

  try {
    await prisma.follow.create({
      data: { followerId, followingId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return;
    }

    throw error;
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const prisma = getPrisma();

  try {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return;
    }

    throw error;
  }
}
