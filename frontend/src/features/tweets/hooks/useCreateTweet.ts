import { useState, useCallback } from 'react';
import { createTweet } from '../api/createTweetApi.js';

interface UseCreateTweetResult {
  submit: (content: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateTweet(onSuccess?: () => void): UseCreateTweetResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (content: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await createTweet({ content });
        onSuccess?.();
        return true;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { error?: string } } };
          setError(axiosErr.response?.data?.error ?? 'Failed to create tweet');
        } else {
          setError('Failed to create tweet');
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess],
  );

  return { submit, isLoading, error };
}
