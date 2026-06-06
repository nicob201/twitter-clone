import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { getFollowing } from '../following.service.js';
import { AppError } from '../../../shared/errors/index.js';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface FollowingData {
  data: Array<{ id: string; username: string }>;
}

const mockDb = {
  user: {
    findUnique: vi.fn(),
  },
  follow: {
    findMany: vi.fn(),
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

describe('getFollowing service', () => {
  it('should query follow.findMany with followerId and select following', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockDb.follow.findMany.mockResolvedValue([]);

    await getFollowing('user-1');

    expect(mockDb.follow.findMany).toHaveBeenCalledWith({
      where: { followerId: 'user-1' },
      select: { following: { select: { id: true, username: true } } },
    });
  });

  it('should throw AppError(404) when user is not found', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    await expect(getFollowing('nonexistent')).rejects.toThrow(AppError);

    await expect(getFollowing('nonexistent')).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
  });
});

describe('GET /api/users/:userId/following', () => {
  it('should return users followed by the target user', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockDb.follow.findMany.mockResolvedValue([
      {
        following: { id: 'user-2', username: 'alice' },
      },
      {
        following: { id: 'user-3', username: 'bob' },
      },
    ]);

    const res = await request(app).get('/api/users/user-1/following');

    const body = res.body as ApiResponse<FollowingData>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data).toHaveLength(2);
    expect(body.data.data[0]?.username).toBe('alice');
    expect(body.data.data[1]?.username).toBe('bob');
  });

  it('should return empty array when user follows nobody', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockDb.follow.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/users/user-1/following');

    const body = res.body as ApiResponse<FollowingData>;

    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data).toHaveLength(0);
  });

  it('should return 404 when target user does not exist', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/users/nonexistent/following');

    const body = res.body as ApiResponse<never>;

    expect(res.status).toBe(404);
    expect(body.error).toBe('User not found');
  });
});
