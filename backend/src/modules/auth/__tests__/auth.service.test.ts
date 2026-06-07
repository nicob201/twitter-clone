import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../shared/errors/index.js';
import type { Mock } from 'vitest';

vi.mock('../../../shared/db/prisma.js', () => ({
  getPrisma: vi.fn(),
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed-password')),
    compare: vi.fn(() => Promise.resolve(true)),
  },
}));

const mockDb = {
  user: {
    create: vi.fn(),
  },
};

let authService: typeof import('../auth.service.js');

beforeAll(async () => {
  const getPrisma = (await import('../../../shared/db/prisma.js')).getPrisma as Mock;
  getPrisma.mockReturnValue(mockDb);
  authService = await import('../auth.service.js');
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService.register', () => {
  it('should throw AppError with 409 for duplicate email', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed on email', {
      code: 'P2002',
      clientVersion: '7.8.0',
      meta: { target: ['email'] },
    });
    mockDb.user.create.mockRejectedValue(error);

    const promise = authService.register({
      email: 'existing@example.com',
      username: 'newuser',
      password: 'password123',
    });

    await expect(promise).rejects.toThrow(AppError);
    await expect(promise).rejects.toMatchObject({
      message: 'Email already in use',
      statusCode: 409,
    });
  });

  it('should throw AppError with 409 for duplicate username', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed on username', {
      code: 'P2002',
      clientVersion: '7.8.0',
      meta: { target: ['username'] },
    });
    mockDb.user.create.mockRejectedValue(error);

    const promise = authService.register({
      email: 'new@example.com',
      username: 'existinguser',
      password: 'password123',
    });

    await expect(promise).rejects.toThrow(AppError);
    await expect(promise).rejects.toMatchObject({
      message: 'Username already in use',
      statusCode: 409,
    });
  });
});
