import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLikeTweet } from '../hooks/useLikeTweet.js';

const { mockLikeTweet, mockUnlikeTweet } = vi.hoisted(() => ({
  mockLikeTweet: vi.fn(),
  mockUnlikeTweet: vi.fn(),
}));

vi.mock('../api/likesApi.js', () => ({
  likeTweet: mockLikeTweet,
  unlikeTweet: mockUnlikeTweet,
}));

describe('useLikeTweet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('like', () => {
    it('should return true when like succeeds', async () => {
      mockLikeTweet.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLikeTweet());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.like('tweet-1');
      });

      expect(success).toBe(true);
      expect(mockLikeTweet).toHaveBeenCalledWith('tweet-1');
    });

    it('should return false when like fails', async () => {
      mockLikeTweet.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useLikeTweet());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.like('tweet-1');
      });

      expect(success).toBe(false);
    });

    it('should set error state when like fails', async () => {
      mockLikeTweet.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useLikeTweet());

      await act(async () => {
        await result.current.like('tweet-1');
      });

      expect(result.current.error).toBe('Failed to update like');
    });
  });

  describe('unlike', () => {
    it('should return true when unlike succeeds', async () => {
      mockUnlikeTweet.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLikeTweet());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.unlike('tweet-1');
      });

      expect(success).toBe(true);
      expect(mockUnlikeTweet).toHaveBeenCalledWith('tweet-1');
    });

    it('should return false when unlike fails', async () => {
      mockUnlikeTweet.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useLikeTweet());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.unlike('tweet-1');
      });

      expect(success).toBe(false);
    });

    it('should set error state when unlike fails', async () => {
      mockUnlikeTweet.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useLikeTweet());

      await act(async () => {
        await result.current.unlike('tweet-1');
      });

      expect(result.current.error).toBe('Failed to update like');
    });
  });

  describe('loading state', () => {
    it('should set loadingTweetId during like', () => {
      mockLikeTweet.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useLikeTweet());

      act(() => {
        void result.current.like('tweet-1');
      });

      expect(result.current.loadingTweetId).toBe('tweet-1');
      expect(result.current.isLoading).toBe(true);
    });

    it('should clear loadingTweetId after like completes', async () => {
      mockLikeTweet.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLikeTweet());

      await act(async () => {
        await result.current.like('tweet-1');
      });

      expect(result.current.loadingTweetId).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear loadingTweetId after like fails', async () => {
      mockLikeTweet.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useLikeTweet());

      await act(async () => {
        await result.current.like('tweet-1');
      });

      expect(result.current.loadingTweetId).toBeNull();
    });
  });

  describe('error state', () => {
    it('should be null initially', () => {
      const { result } = renderHook(() => useLikeTweet());

      expect(result.current.error).toBeNull();
    });

    it('should be null after successful like', async () => {
      mockLikeTweet.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLikeTweet());

      await act(async () => {
        await result.current.like('tweet-1');
      });

      expect(result.current.error).toBeNull();
    });

    it('should be cleared when a new action starts after failure', async () => {
      mockLikeTweet.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useLikeTweet());

      await act(async () => {
        await result.current.like('tweet-1');
      });

      expect(result.current.error).toBe('Failed to update like');

      mockLikeTweet.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.like('tweet-2');
      });

      expect(result.current.error).toBeNull();
    });
  });
});
