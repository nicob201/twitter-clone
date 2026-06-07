import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProfile } from '../api/userProfileApi.js';
import type { UserProfile } from '../types/user-profile.types.js';

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useUserProfile(userId: string): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generationRef = useRef(0);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const loadProfile = useCallback(async (id: string) => {
    const gen = ++generationRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchProfile(id);
      if (gen === generationRef.current) {
        setProfile(data);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      if (gen === generationRef.current) {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
              'Failed to load profile.')
            : 'Failed to load profile.';
        setError(message);
        setIsLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    void loadProfile(userIdRef.current);
  }, [loadProfile]);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    void loadProfile(userId);
  }, [userId, loadProfile]);

  return { profile, isLoading, error, refresh };
}
