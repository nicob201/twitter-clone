import { getPrisma } from '../../shared/db/prisma.js';
import { AppError } from '../../shared/errors/index.js';
import type { TweetResponse } from './tweets.types.js';
import type { CreateTweetInput } from './tweets.schemas.js';

export async function createTweet(
  input: CreateTweetInput,
  authorId: string,
  imageUrl: string | null,
): Promise<TweetResponse> {
  const prisma = getPrisma();

  const tweet = await prisma.tweet.create({
    data: {
      content: input.content,
      authorId,
      imageUrl,
    },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      authorId: true,
      createdAt: true,
    },
  });

  return tweet;
}

export async function deleteTweet(tweetId: string, userId: string): Promise<void> {
  const prisma = getPrisma();

  const tweet = await prisma.tweet.findUnique({
    where: { id: tweetId },
    select: { authorId: true },
  });

  if (!tweet) {
    throw new AppError('Tweet not found', 404);
  }

  if (tweet.authorId !== userId) {
    throw new AppError('Forbidden', 403);
  }

  await prisma.tweet.delete({
    where: { id: tweetId },
  });
}
