import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFollowUser } from '../hooks/useFollowUser.js';

const { mockFollowUser, mockUnfollowUser } = vi.hoisted(() => ({
  mockFollowUser: vi.fn(),
  mockUnfollowUser: vi.fn(),
}));

vi.mock('../api/followsApi.js', () => ({
  followUser: mockFollowUser,
  unfollowUser: mockUnfollowUser,
}));

describe('useFollowUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('followUser', () => {
    it('should return true when follow succeeds', async () => {
      mockFollowUser.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFollowUser());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.followUser('user-1');
      });

      expect(success).toBe(true);
      expect(mockFollowUser).toHaveBeenCalledWith('user-1');
    });

    it('should return false when follow fails', async () => {
      mockFollowUser.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useFollowUser());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.followUser('user-1');
      });

      expect(success).toBe(false);
    });

    it('should set error state when follow fails', async () => {
      mockFollowUser.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useFollowUser());

      await act(async () => {
        await result.current.followUser('user-1');
      });

      expect(result.current.error).toBe('Failed to update follow');
    });
  });

  describe('unfollowUser', () => {
    it('should return true when unfollow succeeds', async () => {
      mockUnfollowUser.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFollowUser());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.unfollowUser('user-1');
      });

      expect(success).toBe(true);
      expect(mockUnfollowUser).toHaveBeenCalledWith('user-1');
    });

    it('should return false when unfollow fails', async () => {
      mockUnfollowUser.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useFollowUser());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.unfollowUser('user-1');
      });

      expect(success).toBe(false);
    });

    it('should set error state when unfollow fails', async () => {
      mockUnfollowUser.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useFollowUser());

      await act(async () => {
        await result.current.unfollowUser('user-1');
      });

      expect(result.current.error).toBe('Failed to update follow');
    });
  });

  describe('loading state', () => {
    it('should set isLoading during follow', () => {
      mockFollowUser.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useFollowUser());

      act(() => {
        void result.current.followUser('user-1');
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should clear isLoading after follow completes', async () => {
      mockFollowUser.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFollowUser());

      await act(async () => {
        await result.current.followUser('user-1');
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should clear isLoading after follow fails', async () => {
      mockFollowUser.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useFollowUser());

      await act(async () => {
        await result.current.followUser('user-1');
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error state', () => {
    it('should be null initially', () => {
      const { result } = renderHook(() => useFollowUser());

      expect(result.current.error).toBeNull();
    });

    it('should be null after successful follow', async () => {
      mockFollowUser.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFollowUser());

      await act(async () => {
        await result.current.followUser('user-1');
      });

      expect(result.current.error).toBeNull();
    });

    it('should be cleared when a new action starts after failure', async () => {
      mockFollowUser.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useFollowUser());

      await act(async () => {
        await result.current.followUser('user-1');
      });

      expect(result.current.error).toBe('Failed to update follow');

      mockFollowUser.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.followUser('user-2');
      });

      expect(result.current.error).toBeNull();
    });
  });
});
