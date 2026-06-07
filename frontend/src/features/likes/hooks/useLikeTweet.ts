import { useState, useCallback } from 'react';
import { likeTweet, unlikeTweet } from '../api/likesApi.js';

interface UseLikeTweetResult {
  like: (tweetId: string) => Promise<boolean>;
  unlike: (tweetId: string) => Promise<boolean>;
  isLoading: boolean;
  loadingTweetId: string | null;
  error: string | null;
}

async function callApi(
  tweetId: string,
  apiFn: (id: string) => Promise<void>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await apiFn(tweetId);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update like' };
  }
}

export function useLikeTweet(): UseLikeTweetResult {
  const [loadingTweetId, setLoadingTweetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (tweetId: string, apiFn: (id: string) => Promise<void>): Promise<boolean> => {
      setLoadingTweetId(tweetId);
      setError(null);

      const result = await callApi(tweetId, apiFn);

      if (!result.success) {
        setError(result.error);
      }

      setLoadingTweetId(null);
      return result.success;
    },
    [],
  );

  const like = useCallback(
    (tweetId: string): Promise<boolean> => execute(tweetId, likeTweet),
    [execute],
  );

  const unlike = useCallback(
    (tweetId: string): Promise<boolean> => execute(tweetId, unlikeTweet),
    [execute],
  );

  return { like, unlike, isLoading: loadingTweetId !== null, loadingTweetId, error };
}
