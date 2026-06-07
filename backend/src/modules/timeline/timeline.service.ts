import { getPrisma } from '../../shared/db/prisma.js';
import type { TimelineData, TimelineTweet } from './timeline.types.js';

export async function getTimeline(
  userId: string,
  page: number,
  limit: number,
): Promise<TimelineData> {
  const prisma = getPrisma();

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const authorIds = [userId, ...follows.map((f) => f.followingId)];

  const total = await prisma.tweet.count({
    where: { authorId: { in: authorIds } },
  });

  const tweets = await prisma.tweet.findMany({
    where: { authorId: { in: authorIds } },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      _count: {
        select: { likes: true },
      },
    },
  });

  const tweetIds = tweets.map((t) => t.id);

  const likedByUser =
    tweetIds.length > 0
      ? await prisma.like.findMany({
          where: { userId, tweetId: { in: tweetIds } },
          select: { tweetId: true },
        })
      : [];

  const likedTweetIds = new Set(likedByUser.map((l) => l.tweetId));

  const data: TimelineTweet[] = tweets.map((t) => ({
    id: t.id,
    content: t.content,
    createdAt: t.createdAt,
    author: t.author,
    likesCount: t._count.likes,
    likedByCurrentUser: likedTweetIds.has(t.id),
  }));

  return { data, pagination: { page, limit, total } };
}
