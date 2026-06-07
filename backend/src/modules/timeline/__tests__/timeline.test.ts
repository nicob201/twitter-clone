import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TimelineItem {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string };
  likesCount: number;
  likedByCurrentUser: boolean;
}

interface TimelineResponseData {
  data: TimelineItem[];
  pagination: { page: number; limit: number; total: number };
}

const mockDb = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  follow: {
    findMany: vi.fn(),
  },
  tweet: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  like: {
    findMany: vi.fn(),
  },
};

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed-password')),
    compare: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock('../../../shared/db/prisma.js', () => ({
  getPrisma: vi.fn(() => mockDb),
}));

let app: Application;
let authToken: string;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-32chars';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  const { createApp } = await import('../../../app/app.js');
  app = createApp();
});

beforeEach(() => {
  vi.clearAllMocks();
});

async function registerAndGetToken(): Promise<string> {
  mockDb.user.create.mockResolvedValue({
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
  });

  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });

  return (res.body as { data: { token: string } }).data.token;
}

describe('GET /api/timeline', () => {
  beforeEach(async () => {
    authToken = await registerAndGetToken();
  });

  it('should return tweets from followed users and self', async () => {
    mockDb.follow.findMany.mockResolvedValue([
      { followingId: 'user-2' },
      { followingId: 'user-3' },
    ]);

    mockDb.tweet.count.mockResolvedValue(3);

    mockDb.tweet.findMany.mockResolvedValue([
      {
        id: 'tweet-3',
        content: 'Third',
        createdAt: new Date('2025-01-03'),
        author: { id: 'user-3', username: 'user3' },
        _count: { likes: 0 },
      },
      {
        id: 'tweet-2',
        content: 'Second',
        createdAt: new Date('2025-01-02'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 5 },
      },
      {
        id: 'tweet-1',
        content: 'First',
        createdAt: new Date('2025-01-01'),
        author: { id: 'user-2', username: 'user2' },
        _count: { likes: 2 },
      },
    ]);

    mockDb.like.findMany.mockResolvedValue([{ tweetId: 'tweet-2' }]);

    const res = await request(app).get('/api/timeline').set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.pagination.total).toBe(3);
    expect(body.data.data).toHaveLength(3);
    expect(body.data.data[0]?.content).toBe('Third');
    expect(body.data.data[1]?.content).toBe('Second');
    expect(body.data.data[2]?.content).toBe('First');
  });

  it('should return only own tweets when follows nobody', async () => {
    mockDb.follow.findMany.mockResolvedValue([]);
    mockDb.tweet.count.mockResolvedValue(1);
    mockDb.tweet.findMany.mockResolvedValue([
      {
        id: 'tweet-1',
        content: 'My tweet',
        createdAt: new Date('2025-01-01'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
    ]);
    mockDb.like.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/timeline').set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data).toHaveLength(1);
    expect(body.data.data[0]?.author.username).toBe('testuser');
  });

  it('should return tweets in descending date order', async () => {
    mockDb.follow.findMany.mockResolvedValue([]);
    mockDb.tweet.count.mockResolvedValue(3);
    mockDb.tweet.findMany.mockResolvedValue([
      {
        id: 'tweet-3',
        content: 'Newest',
        createdAt: new Date('2025-01-03'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
      {
        id: 'tweet-2',
        content: 'Middle',
        createdAt: new Date('2025-01-02'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
      {
        id: 'tweet-1',
        content: 'Oldest',
        createdAt: new Date('2025-01-01'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
    ]);
    mockDb.like.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/timeline').set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data[0]?.content).toBe('Newest');
    expect(body.data.data[1]?.content).toBe('Middle');
    expect(body.data.data[2]?.content).toBe('Oldest');
  });

  it('should paginate results', async () => {
    mockDb.follow.findMany.mockResolvedValue([]);
    mockDb.tweet.count.mockResolvedValue(5);
    mockDb.tweet.findMany.mockResolvedValue([
      {
        id: 'tweet-5',
        content: 'Fifth',
        createdAt: new Date('2025-01-05'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
      {
        id: 'tweet-4',
        content: 'Fourth',
        createdAt: new Date('2025-01-04'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
    ]);
    mockDb.like.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/timeline?page=2&limit=2')
      .set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.pagination.page).toBe(2);
    expect(body.data.pagination.limit).toBe(2);
    expect(body.data.pagination.total).toBe(5);
    expect(body.data.data).toHaveLength(2);
    expect(body.data.data[0]?.content).toBe('Fifth');
  });

  it('should return empty timeline', async () => {
    mockDb.follow.findMany.mockResolvedValue([]);
    mockDb.tweet.count.mockResolvedValue(0);
    mockDb.tweet.findMany.mockResolvedValue([]);
    mockDb.like.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/timeline').set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data).toHaveLength(0);
    expect(body.data.pagination.total).toBe(0);
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/timeline');

    expect(res.status).toBe(401);
  });

  it('should set likedByCurrentUser to true when user liked the tweet', async () => {
    mockDb.follow.findMany.mockResolvedValue([]);
    mockDb.tweet.count.mockResolvedValue(2);
    mockDb.tweet.findMany.mockResolvedValue([
      {
        id: 'tweet-1',
        content: 'Tweet one',
        createdAt: new Date('2025-01-02'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 3 },
      },
      {
        id: 'tweet-2',
        content: 'Tweet two',
        createdAt: new Date('2025-01-01'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 1 },
      },
    ]);
    mockDb.like.findMany.mockResolvedValue([{ tweetId: 'tweet-1' }]);

    const res = await request(app).get('/api/timeline').set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data[0]?.likedByCurrentUser).toBe(true);
    expect(body.data.data[1]?.likedByCurrentUser).toBe(false);
  });

  it('should set likedByCurrentUser to false when user did not like any tweets', async () => {
    mockDb.follow.findMany.mockResolvedValue([]);
    mockDb.tweet.count.mockResolvedValue(1);
    mockDb.tweet.findMany.mockResolvedValue([
      {
        id: 'tweet-1',
        content: 'Not liked',
        createdAt: new Date('2025-01-01'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
    ]);
    mockDb.like.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/timeline').set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data[0]?.likedByCurrentUser).toBe(false);
  });

  it('should keep likesCount correct alongside likedByCurrentUser', async () => {
    mockDb.follow.findMany.mockResolvedValue([]);
    mockDb.tweet.count.mockResolvedValue(2);
    mockDb.tweet.findMany.mockResolvedValue([
      {
        id: 'tweet-1',
        content: 'Popular',
        createdAt: new Date('2025-01-02'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 10 },
      },
      {
        id: 'tweet-2',
        content: 'Unpopular',
        createdAt: new Date('2025-01-01'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
    ]);
    mockDb.like.findMany.mockResolvedValue([{ tweetId: 'tweet-1' }]);

    const res = await request(app).get('/api/timeline').set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data[0]?.likesCount).toBe(10);
    expect(body.data.data[0]?.likedByCurrentUser).toBe(true);
    expect(body.data.data[1]?.likesCount).toBe(0);
    expect(body.data.data[1]?.likedByCurrentUser).toBe(false);
  });

  it('should preserve pagination alongside likedByCurrentUser', async () => {
    mockDb.follow.findMany.mockResolvedValue([]);
    mockDb.tweet.count.mockResolvedValue(1);
    mockDb.tweet.findMany.mockResolvedValue([
      {
        id: 'tweet-1',
        content: 'Paginated',
        createdAt: new Date('2025-01-01'),
        author: { id: 'user-1', username: 'testuser' },
        _count: { likes: 0 },
      },
    ]);
    mockDb.like.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/timeline?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<TimelineResponseData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.pagination.page).toBe(1);
    expect(body.data.pagination.limit).toBe(10);
    expect(body.data.pagination.total).toBe(1);
  });
});
