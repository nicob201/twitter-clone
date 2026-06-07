import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { Prisma } from '@prisma/client';
import { setupTestApp, registerUser } from '../../../shared/test-utils/auth.js';

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
  follow: {
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
  app = await setupTestApp();
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

  return registerUser(app);
}

describe('POST /api/users/:userId/follow', () => {
  beforeEach(async () => {
    authToken = await registerAndGetToken();
  });

  it('should follow a user', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'target-1' });
    mockDb.follow.create.mockResolvedValue({ followerId: 'user-1', followingId: 'target-1' });

    const res = await request(app)
      .post('/api/users/target-1/follow')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should reject following yourself', async () => {
    const res = await request(app)
      .post('/api/users/user-1/follow')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
  });

  it('should reject when target user not found', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/users/target-404/follow')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it('should be idempotent on duplicate follow', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'target-1' });
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });
    mockDb.follow.create.mockRejectedValue(error);

    const res = await request(app)
      .post('/api/users/target-1/follow')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).post('/api/users/target-1/follow');

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/users/:userId/follow', () => {
  beforeEach(async () => {
    authToken = await registerAndGetToken();
  });

  it('should unfollow a user', async () => {
    mockDb.follow.delete.mockResolvedValue({ followerId: 'user-1', followingId: 'target-1' });

    const res = await request(app)
      .delete('/api/users/target-1/follow')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should be idempotent on repeated unfollow', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '7.8.0',
    });
    mockDb.follow.delete.mockRejectedValue(error);

    const res = await request(app)
      .delete('/api/users/target-1/follow')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).delete('/api/users/target-1/follow');

    expect(res.status).toBe(401);
  });
});
