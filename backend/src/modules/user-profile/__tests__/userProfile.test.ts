import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UserProfileData {
  id: string;
  username: string;
  createdAt: string;
  tweetsCount: number;
  followersCount: number;
  followingCount: number;
}

const mockDb = {
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock('../../../shared/db/prisma.js', () => ({
  getPrisma: vi.fn(() => mockDb),
}));

let app: Application;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-32chars';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  const { createApp } = await import('../../../app/app.js');
  app = createApp();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/users/:userId', () => {
  it('should return user profile with all counts', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      createdAt: new Date('2025-01-01'),
      _count: {
        tweets: 42,
        followers: 100,
        following: 7,
      },
    });

    const res = await request(app).get('/api/users/user-1');

    const body = res.body as ApiResponse<UserProfileData>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.id).toBe('user-1');
    expect(body.data.username).toBe('testuser');
    expect(body.data.tweetsCount).toBe(42);
    expect(body.data.followersCount).toBe(100);
    expect(body.data.followingCount).toBe(7);
  });

  it('should return 404 for missing user', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/users/nonexistent');

    const body = res.body as ApiResponse<never>;

    expect(res.status).toBe(404);
    expect(body.error).toBe('User not found');
  });
});
