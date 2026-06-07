import { useCallback, useRef } from 'react';
import { useFollowUser } from '../../follows/hooks/useFollowUser.js';

interface UseProfileFollowResult {
  follow: (userId: string) => Promise<boolean>;
  unfollow: (userId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useProfileFollow(onRefreshProfile: () => void): UseProfileFollowResult {
  const { followUser, unfollowUser, isLoading, error } = useFollowUser();
  const refreshRef = useRef(onRefreshProfile);

  refreshRef.current = onRefreshProfile;

  const follow = useCallback(
    async (userId: string): Promise<boolean> => {
      const success = await followUser(userId);
      if (success) {
        refreshRef.current();
      }
      return success;
    },
    [followUser],
  );

  const unfollow = useCallback(
    async (userId: string): Promise<boolean> => {
      const success = await unfollowUser(userId);
      if (success) {
        refreshRef.current();
      }
      return success;
    },
    [unfollowUser],
  );

  return { follow, unfollow, isLoading, error };
}
