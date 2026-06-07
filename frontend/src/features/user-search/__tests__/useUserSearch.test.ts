import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserSearch } from '../hooks/useUserSearch.js';

const { mockSearchUsers } = vi.hoisted(() => ({
  mockSearchUsers: vi.fn(),
}));

vi.mock('../api/userSearchApi.js', () => ({
  searchUsers: mockSearchUsers,
}));

describe('useUserSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set error for queries shorter than 2 characters', () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.search('a');
    });

    expect(result.current.error).toBe('Query must be between 2 and 50 characters.');
    expect(result.current.hasSearched).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.users).toEqual([]);
    expect(mockSearchUsers).not.toHaveBeenCalled();
  });

  it('should set error for queries longer than 50 characters', () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.search('a'.repeat(51));
    });

    expect(result.current.error).toBe('Query must be between 2 and 50 characters.');
    expect(result.current.hasSearched).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.users).toEqual([]);
    expect(mockSearchUsers).not.toHaveBeenCalled();
  });

  it('should return users on successful search', async () => {
    const mockUsers = [
      { id: '1', username: 'alice' },
      { id: '2', username: 'bob' },
    ];

    mockSearchUsers.mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.search('alice');
    });

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasSearched).toBe(true);
    expect(mockSearchUsers).toHaveBeenCalledWith('alice');
  });

  it('should handle empty results', async () => {
    mockSearchUsers.mockResolvedValue([]);

    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.search('xyz');
    });

    await waitFor(() => {
      expect(result.current.users).toEqual([]);
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasSearched).toBe(true);
  });

  it('should set error on API failure', async () => {
    mockSearchUsers.mockRejectedValue({
      response: { data: { error: 'Search failed' } },
    });

    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.search('alice');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Search failed');
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasSearched).toBe(true);
  });

  it('should use fallback error message on API failure without error detail', async () => {
    mockSearchUsers.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.search('alice');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to search users.');
    });
  });

  it('should show loading state during search', () => {
    mockSearchUsers.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useUserSearch());

    act(() => {
      result.current.search('alice');
    });

    expect(result.current.isLoading).toBe(true);
  });
});
