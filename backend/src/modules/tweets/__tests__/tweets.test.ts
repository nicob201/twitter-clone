import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

interface AuthRegisterData {
  user: { id: string; email: string; username: string };
  token: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TweetData {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

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
    create: vi.fn(),
    findUnique: vi.fn(),
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

  const body = res.body as ApiResponse<AuthRegisterData>;

  if (!body.data) {
    throw new Error('Register response missing data');
  }

  return body.data.token;
}

describe('POST /api/tweets', () => {
  describe('authenticated', () => {
    beforeEach(async () => {
      authToken = await registerAndGetToken();
    });

    it('should create a tweet', async () => {
      const now = new Date();
      mockDb.tweet.create.mockResolvedValue({
        id: 'tweet-1',
        content: 'Hello world',
        authorId: 'user-1',
        createdAt: now,
      });

      const res = await request(app)
        .post('/api/tweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Hello world' });

      const body = res.body as ApiResponse<TweetData>;

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();

      if (!body.data) return;

      expect(body.data.content).toBe('Hello world');
      expect(body.data.authorId).toBe('user-1');
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
    });

    it('should reject empty content', async () => {
      const res = await request(app)
        .post('/api/tweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '' });

      expect(res.status).toBe(400);
    });

    it('should reject content over 280 characters', async () => {
      const res = await request(app)
        .post('/api/tweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'a'.repeat(281) });

      expect(res.status).toBe(400);
    });
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).post('/api/tweets').send({ content: 'Hello world' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/tweets/:id', () => {
  describe('authenticated', () => {
    beforeEach(async () => {
      authToken = await registerAndGetToken();
    });

    it('should delete own tweet', async () => {
      mockDb.tweet.findUnique.mockResolvedValue({ authorId: 'user-1' });
      mockDb.tweet.delete.mockResolvedValue({ id: 'tweet-1' });

      const res = await request(app)
        .delete('/api/tweets/tweet-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    });

    it('should reject when tweet not found', async () => {
      mockDb.tweet.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/tweets/tweet-404')
        .set('Authorization', `Bearer ${authToken}`);

      const body = res.body as ApiResponse<never>;

      expect(res.status).toBe(404);
      expect(body.error).toBe('Tweet not found');
    });

    it('should reject when not the owner', async () => {
      mockDb.tweet.findUnique.mockResolvedValue({ authorId: 'other-user' });

      const res = await request(app)
        .delete('/api/tweets/tweet-1')
        .set('Authorization', `Bearer ${authToken}`);

      const body = res.body as ApiResponse<never>;

      expect(res.status).toBe(403);
      expect(body.error).toBe('Forbidden');
    });
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).delete('/api/tweets/tweet-1');

    expect(res.status).toBe(401);
  });
});
