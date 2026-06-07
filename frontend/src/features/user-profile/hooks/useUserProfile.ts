import { useState, useEffect } from 'react';
import { fetchProfile } from '../api/userProfileApi.js';
import type { UserProfile } from '../types/user-profile.types.js';

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export function useUserProfile(userId: string): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetchProfile(userId)
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err && typeof err === 'object' && 'response' in err
              ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
                'Failed to load profile.')
              : 'Failed to load profile.';
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, isLoading, error };
}
