import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { createDeferred } from '../../../shared/test-utils/deferred.js';

const { mockFetchProfile } = vi.hoisted(() => ({
  mockFetchProfile: vi.fn(),
}));

vi.mock('../api/userProfileApi.js', () => ({
  fetchProfile: mockFetchProfile,
}));

const mockProfile = {
  id: 'user-1',
  username: 'testuser',
  createdAt: '2025-01-01T00:00:00.000Z',
  tweetsCount: 42,
  followersCount: 100,
  followingCount: 7,
  isFollowedByCurrentUser: false,
};

const mockProfileB = {
  id: 'user-2',
  username: 'otheruser',
  createdAt: '2025-01-01T00:00:00.000Z',
  tweetsCount: 10,
  followersCount: 5,
  followingCount: 2,
  isFollowedByCurrentUser: false,
};

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', async () => {
    const deferred = createDeferred<unknown>();
    mockFetchProfile.mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useUserProfile('user-1'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();

    deferred.resolve(mockProfile);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return profile on success', async () => {
    mockFetchProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useUserProfile('user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.error).toBeNull();
    expect(mockFetchProfile).toHaveBeenCalledWith('user-1');
  });

  it('should set error on API failure', async () => {
    mockFetchProfile.mockRejectedValue({
      response: { data: { error: 'User not found' } },
    });

    const { result } = renderHook(() => useUserProfile('user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe('User not found');
  });

  it('should use fallback error message on network error', async () => {
    mockFetchProfile.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserProfile('user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load profile.');
  });

  it('should not fetch when userId is empty', () => {
    const { result } = renderHook(() => useUserProfile(''));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockFetchProfile).not.toHaveBeenCalled();
  });

  it('should reuse loadProfile path for refresh', async () => {
    mockFetchProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useUserProfile('user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchProfile).toHaveBeenCalledTimes(1);

    mockFetchProfile.mockClear();
    mockFetchProfile.mockResolvedValue(mockProfile);

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(mockFetchProfile).toHaveBeenCalledTimes(1);
      expect(mockFetchProfile).toHaveBeenCalledWith('user-1');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
  });

  it('should refetch when userId changes', async () => {
    mockFetchProfile.mockResolvedValue(mockProfile);

    const { result, rerender } = renderHook((id: string) => useUserProfile(id), {
      initialProps: 'user-1',
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile?.id).toBe('user-1');

    mockFetchProfile.mockResolvedValue(mockProfileB);

    rerender('user-2');

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.profile?.id).toBe('user-2');
    });

    expect(mockFetchProfile).toHaveBeenCalledWith('user-2');
  });

  it('should protect against stale requests when userId changes', async () => {
    const deferredA = createDeferred<unknown>();
    const deferredB = createDeferred<unknown>();

    mockFetchProfile.mockReturnValueOnce(deferredA.promise).mockReturnValueOnce(deferredB.promise);

    const { result, rerender } = renderHook((id: string) => useUserProfile(id), {
      initialProps: 'user-a',
    });

    expect(result.current.isLoading).toBe(true);

    rerender('user-b');

    deferredA.resolve(mockProfile);

    await waitFor(() => {
      expect(mockFetchProfile).toHaveBeenCalledTimes(2);
    });

    expect(result.current.profile).toBeNull();

    deferredB.resolve(mockProfileB);

    await waitFor(() => {
      expect(result.current.profile?.id).toBe('user-2');
    });
  });
});
