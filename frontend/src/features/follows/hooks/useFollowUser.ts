import { useState, useCallback } from 'react';
import { followUser as followUserApi, unfollowUser as unfollowUserApi } from '../api/followsApi.js';

interface UseFollowUserResult {
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

async function callApi(
  userId: string,
  apiFn: (id: string) => Promise<void>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await apiFn(userId);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update follow' };
  }
}

export function useFollowUser(): UseFollowUserResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (userId: string, apiFn: (id: string) => Promise<void>): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      const result = await callApi(userId, apiFn);
      if (!result.success) {
        setError(result.error);
      }
      setIsLoading(false);
      return result.success;
    },
    [],
  );

  const followUser = useCallback(
    (userId: string): Promise<boolean> => execute(userId, followUserApi),
    [execute],
  );

  const unfollowUser = useCallback(
    (userId: string): Promise<boolean> => execute(userId, unfollowUserApi),
    [execute],
  );

  return { followUser, unfollowUser, isLoading, error };
}
