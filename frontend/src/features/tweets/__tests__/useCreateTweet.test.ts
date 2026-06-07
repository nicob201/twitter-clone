import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateTweet } from '../hooks/useCreateTweet.js';

const { mockCreateTweet } = vi.hoisted(() => ({
  mockCreateTweet: vi.fn(),
}));

vi.mock('../api/createTweetApi.js', () => ({
  createTweet: mockCreateTweet,
}));

describe('useCreateTweet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when tweet creation succeeds', async () => {
    mockCreateTweet.mockResolvedValue({
      id: '1',
      content: 'Hello',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useCreateTweet());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.submit('Hello');
    });

    expect(success).toBe(true);
  });

  it('should return false when tweet creation fails with API error', async () => {
    mockCreateTweet.mockRejectedValue({
      response: { data: { error: 'Something went wrong' } },
    });

    const { result } = renderHook(() => useCreateTweet());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.submit('Hello');
    });

    expect(success).toBe(false);
  });

  it('should return false when tweet creation fails with network error', async () => {
    mockCreateTweet.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateTweet());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.submit('Hello');
    });

    expect(success).toBe(false);
  });

  it('should call onSuccess callback when creation succeeds', async () => {
    mockCreateTweet.mockResolvedValue({
      id: '1',
      content: 'Hello',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreateTweet(onSuccess));

    await act(async () => {
      await result.current.submit('Hello');
    });

    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('should not call onSuccess callback when creation fails', async () => {
    mockCreateTweet.mockRejectedValue({
      response: { data: { error: 'Error' } },
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreateTweet(onSuccess));

    await act(async () => {
      await result.current.submit('Hello');
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should set isLoading to false after successful creation', async () => {
    mockCreateTweet.mockResolvedValue({
      id: '1',
      content: 'Hello',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useCreateTweet());

    await act(async () => {
      await result.current.submit('Hello');
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set isLoading to false after failed creation', async () => {
    mockCreateTweet.mockRejectedValue({
      response: { data: { error: 'Error' } },
    });

    const { result } = renderHook(() => useCreateTweet());

    await act(async () => {
      await result.current.submit('Hello');
    });

    expect(result.current.isLoading).toBe(false);
  });
});
