import { Prisma } from '@prisma/client';
import { getPrisma } from '../../shared/db/prisma.js';
import { AppError } from '../../shared/errors/index.js';

export async function likeTweet(userId: string, tweetId: string): Promise<void> {
  const prisma = getPrisma();

  const tweet = await prisma.tweet.findUnique({
    where: { id: tweetId },
    select: { id: true },
  });

  if (!tweet) {
    throw new AppError('Tweet not found', 404);
  }

  try {
    await prisma.like.create({
      data: { userId, tweetId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return;
    }

    throw error;
  }
}

export async function unlikeTweet(userId: string, tweetId: string): Promise<void> {
  const prisma = getPrisma();

  try {
    await prisma.like.delete({
      where: { userId_tweetId: { userId, tweetId } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return;
    }

    throw error;
  }
}
