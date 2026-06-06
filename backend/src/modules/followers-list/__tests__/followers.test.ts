import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { getFollowers } from '../followers.service.js';
import { AppError } from '../../../shared/errors/index.js';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface FollowersData {
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

describe('getFollowers service', () => {
  it('should query follow.findMany with followingId and select follower', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockDb.follow.findMany.mockResolvedValue([]);

    await getFollowers('user-1');

    expect(mockDb.follow.findMany).toHaveBeenCalledWith({
      where: { followingId: 'user-1' },
      select: { follower: { select: { id: true, username: true } } },
    });
  });

  it('should throw AppError(404) when user is not found', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    await expect(getFollowers('nonexistent')).rejects.toThrow(AppError);

    await expect(getFollowers('nonexistent')).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
  });
});

describe('GET /api/users/:userId/followers', () => {
  it('should return followers for a user', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockDb.follow.findMany.mockResolvedValue([
      {
        follower: { id: 'follower-1', username: 'alice' },
      },
      {
        follower: { id: 'follower-2', username: 'bob' },
      },
    ]);

    const res = await request(app).get('/api/users/user-1/followers');

    const body = res.body as ApiResponse<FollowersData>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data).toHaveLength(2);
    expect(body.data.data[0]?.username).toBe('alice');
    expect(body.data.data[1]?.username).toBe('bob');
  });

  it('should return empty array when user has no followers', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockDb.follow.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/users/user-1/followers');

    const body = res.body as ApiResponse<FollowersData>;

    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data).toHaveLength(0);
  });

  it('should return 404 when target user does not exist', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/users/nonexistent/followers');

    const body = res.body as ApiResponse<never>;

    expect(res.status).toBe(404);
    expect(body.error).toBe('User not found');
  });
});
