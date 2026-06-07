import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { setupTestApp, registerUser } from '../../../shared/test-utils/auth.js';

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
  isFollowedByCurrentUser: boolean;
  bio: string | null;
  avatarUrl: string | null;
}

const mockDb = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  follow: {
    findUnique: vi.fn(),
  },
};

vi.mock('../../../shared/db/prisma.js', () => ({
  getPrisma: vi.fn(() => mockDb),
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed-password')),
    compare: vi.fn(() => Promise.resolve(true)),
  },
}));

let app: Application;
let authToken: string;

beforeAll(async () => {
  app = await setupTestApp();
});

beforeEach(async () => {
  vi.clearAllMocks();

  mockDb.user.create.mockResolvedValue({
    id: 'current-user',
    email: 'auth@example.com',
    username: 'authuser',
  });

  authToken = await registerUser(app);
});

describe('GET /api/users/:userId', () => {
  it('should return user profile with all counts and follow state', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      createdAt: new Date('2025-01-01'),
      bio: 'A test user',
      avatarUrl: 'https://example.com/avatar.png',
      _count: {
        tweets: 42,
        followers: 100,
        following: 7,
      },
    });
    mockDb.follow.findUnique.mockResolvedValue({
      followerId: 'current-user',
      followingId: 'user-1',
    });

    const res = await request(app)
      .get('/api/users/user-1')
      .set('Authorization', `Bearer ${authToken}`);

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
    expect(body.data.isFollowedByCurrentUser).toBe(true);
    expect(body.data.bio).toBe('A test user');
    expect(body.data.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('should return isFollowedByCurrentUser as false when not following', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-2',
      username: 'otheruser',
      createdAt: new Date('2025-01-01'),
      _count: { tweets: 5, followers: 10, following: 3 },
    });
    mockDb.follow.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/users/user-2')
      .set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<UserProfileData>;

    expect(res.status).toBe(200);
    expect(body.data?.isFollowedByCurrentUser).toBe(false);
  });

  it('should return isFollowedByCurrentUser as false for own profile', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: 'current-user',
      username: 'authuser',
      createdAt: new Date('2025-01-01'),
      _count: { tweets: 10, followers: 5, following: 2 },
    });

    const res = await request(app)
      .get('/api/users/current-user')
      .set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<UserProfileData>;

    expect(res.status).toBe(200);
    expect(body.data?.id).toBe('current-user');
    expect(body.data?.isFollowedByCurrentUser).toBe(false);
  });

  it('should return 404 for missing user', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/users/nonexistent')
      .set('Authorization', `Bearer ${authToken}`);

    const body = res.body as ApiResponse<never>;

    expect(res.status).toBe(404);
    expect(body.error).toBe('User not found');
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/users/user-1');

    expect(res.status).toBe(401);
  });

  it('should handle follow lookup failure gracefully', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      createdAt: new Date('2025-01-01'),
      _count: { tweets: 42, followers: 100, following: 7 },
    });
    mockDb.follow.findUnique.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .get('/api/users/user-1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(500);
  });

  it('should accept userId at maximum length (36 characters)', async () => {
    const maxId = 'a'.repeat(36);
    mockDb.user.findUnique.mockResolvedValue({
      id: maxId,
      username: 'maxlen',
      createdAt: new Date('2025-01-01'),
      _count: { tweets: 1, followers: 0, following: 0 },
    });
    mockDb.follow.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/users/${maxId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
  });

  it('should accept userId one character below maximum (35 characters)', async () => {
    const nearMaxId = 'a'.repeat(35);
    mockDb.user.findUnique.mockResolvedValue({
      id: nearMaxId,
      username: 'nearmax',
      createdAt: new Date('2025-01-01'),
      _count: { tweets: 1, followers: 0, following: 0 },
    });
    mockDb.follow.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/users/${nearMaxId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
  });

  it('should reject userId one character above maximum (37 characters)', async () => {
    const tooLongId = 'a'.repeat(37);

    const res = await request(app)
      .get(`/api/users/${tooLongId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
  });
});
