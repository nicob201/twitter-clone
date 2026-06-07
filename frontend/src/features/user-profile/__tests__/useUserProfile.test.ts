import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserProfile } from '../hooks/useUserProfile.js';

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
};

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    mockFetchProfile.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useUserProfile('user-1'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
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
});
