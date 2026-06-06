import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { Prisma } from '@prisma/client';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed-password')),
    compare: vi.fn(() => Promise.resolve(true)),
  },
}));

const mockDb = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  tweet: {
    findUnique: vi.fn(),
  },
  like: {
    create: vi.fn(),
    delete: vi.fn(),
  },
};

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

describe('POST /api/tweets/:tweetId/like', () => {
  beforeEach(async () => {
    authToken = await registerAndGetToken();
  });

  it('should like a tweet', async () => {
    mockDb.tweet.findUnique.mockResolvedValue({ id: 'tweet-1' });
    mockDb.like.create.mockResolvedValue({ userId: 'user-1', tweetId: 'tweet-1' });

    const res = await request(app)
      .post('/api/tweets/tweet-1/like')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should reject when tweet not found', async () => {
    mockDb.tweet.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/tweets/tweet-404/like')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it('should be idempotent on duplicate like', async () => {
    mockDb.tweet.findUnique.mockResolvedValue({ id: 'tweet-1' });
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });
    mockDb.like.create.mockRejectedValue(error);

    const res = await request(app)
      .post('/api/tweets/tweet-1/like')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).post('/api/tweets/tweet-1/like');

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/tweets/:tweetId/like', () => {
  beforeEach(async () => {
    authToken = await registerAndGetToken();
  });

  it('should unlike a tweet', async () => {
    mockDb.like.delete.mockResolvedValue({ userId: 'user-1', tweetId: 'tweet-1' });

    const res = await request(app)
      .delete('/api/tweets/tweet-1/like')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should be idempotent on repeated unlike', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '7.8.0',
    });
    mockDb.like.delete.mockRejectedValue(error);

    const res = await request(app)
      .delete('/api/tweets/tweet-1/like')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).delete('/api/tweets/tweet-1/like');

    expect(res.status).toBe(401);
  });
});
