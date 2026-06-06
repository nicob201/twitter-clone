import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import type { Mock } from 'vitest';
import { Prisma } from '@prisma/client';

interface TestResponseBody {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

interface AuthData {
  user: { id: string; email: string; username: string };
  token: string;
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

describe('POST /api/auth/register', () => {
  it('should create a user and return token', async () => {
    mockDb.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });

    const body = res.body as TestResponseBody;
    const data = body.data as AuthData;

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.username).toBe('testuser');
    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe('string');
  });

  it('should reject duplicate email', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed on email', {
      code: 'P2002',
      clientVersion: '7.8.0',
      meta: { target: ['email'] },
    });
    mockDb.user.create.mockRejectedValue(error);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'another', password: 'password123' });

    const body = res.body as TestResponseBody;

    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Email already in use');
  });

  it('should reject duplicate username', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed on username', {
      code: 'P2002',
      clientVersion: '7.8.0',
      meta: { target: ['username'] },
    });
    mockDb.user.create.mockRejectedValue(error);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@example.com', username: 'testuser', password: 'password123' });

    const body = res.body as TestResponseBody;

    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Username already in use');
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'short' });

    const body = res.body as TestResponseBody;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', username: 'testuser', password: 'password123' });

    const body = res.body as TestResponseBody;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('should login successfully with valid credentials', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed-password',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    const body = res.body as TestResponseBody;
    const data = body.data as AuthData;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(data.user.email).toBe('test@example.com');
    expect(data.token).toBeDefined();
  });

  it('should reject invalid password', async () => {
    const bcryptModule = await import('bcrypt');
    (bcryptModule.default.compare as Mock).mockResolvedValueOnce(false);

    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed-password',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong-password' });

    const body = res.body as TestResponseBody;

    expect(res.status).toBe(401);
    expect(body.error).toBe('Invalid credentials');
  });

  it('should reject non-existent email', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    const body = res.body as TestResponseBody;

    expect(res.status).toBe(401);
    expect(body.error).toBe('Invalid credentials');
  });

  it('should not reveal which field is incorrect', async () => {
    const emailNotFound = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'password123' });

    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed-password',
    });

    const bcryptModule = await import('bcrypt');
    (bcryptModule.default.compare as Mock).mockResolvedValueOnce(false);

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });

    const emailBody = emailNotFound.body as TestResponseBody;
    const passwordBody = wrongPassword.body as TestResponseBody;

    expect(emailBody.error).toBe(passwordBody.error);
  });
});

describe('GET /api/auth/me', () => {
  it('should return authenticated user', async () => {
    mockDb.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
    });

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });

    const registerBody = registerRes.body as TestResponseBody;
    const registerData = registerBody.data as AuthData;
    const token: string = registerData.token;

    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      bio: 'Hello world',
      avatarUrl: null,
    });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    const body = res.body as TestResponseBody;
    const data = body.data as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(data.id).toBe('user-1');
    expect(data.email).toBe('test@example.com');
    expect(data.bio).toBe('Hello world');
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');
    const body = res.body as TestResponseBody;

    expect(res.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });

  it('should reject invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token');

    const body = res.body as TestResponseBody;

    expect(res.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });

  it('should reject missing authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
