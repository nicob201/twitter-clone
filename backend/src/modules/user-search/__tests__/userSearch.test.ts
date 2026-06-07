import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { searchUsers } from '../userSearch.service.js';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SearchData {
  data: Array<{ id: string; username: string }>;
}

const mockDb = {
  user: {
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

describe('searchUsers service', () => {
  it('should query with contains, case-insensitive mode, and take 20', async () => {
    mockDb.user.findMany.mockResolvedValue([]);

    await searchUsers('alice');

    expect(mockDb.user.findMany).toHaveBeenCalledWith({
      where: {
        username: {
          contains: 'alice',
          mode: 'insensitive',
        },
      },
      select: { id: true, username: true },
      take: 20,
    });
  });
});

describe('GET /api/users/search', () => {
  it('should return matching users', async () => {
    mockDb.user.findMany.mockResolvedValue([
      { id: 'user-1', username: 'alice' },
      { id: 'user-2', username: 'alex' },
    ]);

    const res = await request(app).get('/api/users/search?q=al');

    const body = res.body as ApiResponse<SearchData>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data).toHaveLength(2);
    expect(body.data.data[0]?.username).toBe('alice');
    expect(body.data.data[1]?.username).toBe('alex');
  });

  it('should return empty array when no matches', async () => {
    mockDb.user.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/users/search?q=nonexistent');

    const body = res.body as ApiResponse<SearchData>;

    expect(body.data).toBeDefined();

    if (!body.data) return;

    expect(body.data.data).toHaveLength(0);
  });

  it('should return 400 when query is too short', async () => {
    const res = await request(app).get('/api/users/search?q=a');

    expect(res.status).toBe(400);
  });

  it('should return 400 when query is whitespace only', async () => {
    const res = await request(app).get('/api/users/search?q=   ');

    expect(res.status).toBe(400);
  });

  it('should return 400 when query exceeds maximum length', async () => {
    const res = await request(app).get('/api/users/search?q=' + 'a'.repeat(51));

    expect(res.status).toBe(400);
  });

  it('should return 400 when query is missing', async () => {
    const res = await request(app).get('/api/users/search');

    expect(res.status).toBe(400);
  });
});
