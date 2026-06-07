import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isFollowing } from '../follows.service.js';

const mockFindUnique = vi.fn();

vi.mock('../../../shared/db/prisma.js', () => ({
  getPrisma: vi.fn(() => ({
    follow: {
      findUnique: mockFindUnique,
    },
  })),
}));

describe('isFollowing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when following self (no Prisma call)', async () => {
    const result = await isFollowing('user-1', 'user-1');

    expect(result).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('should return true when follow exists', async () => {
    mockFindUnique.mockResolvedValue({ followerId: 'user-1', followingId: 'user-2' });

    const result = await isFollowing('user-1', 'user-2');

    expect(result).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });

  it('should return false when follow does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await isFollowing('user-1', 'user-2');

    expect(result).toBe(false);
  });

  it('should throw on Prisma failure', async () => {
    mockFindUnique.mockRejectedValue(new Error('Database connection lost'));

    await expect(isFollowing('user-1', 'user-2')).rejects.toThrow('Database connection lost');
  });
});
