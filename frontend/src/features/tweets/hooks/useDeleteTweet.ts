import { useState, useCallback, useRef } from 'react';
import { deleteTweet } from '../api/deleteTweetApi.js';

interface UseDeleteTweetResult {
  deleteTweet: (tweetId: string) => Promise<boolean>;
  isLoading: boolean;
  deletingTweetId: string | null;
  error: string | null;
}

async function callApi(
  tweetId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await deleteTweet(tweetId);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete tweet' };
  }
}

export function useDeleteTweet(): UseDeleteTweetResult {
  const [deletingTweetId, setDeletingTweetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const execute = useCallback(async (tweetId: string): Promise<boolean> => {
    if (loadingRef.current) {
      return false;
    }

    loadingRef.current = true;
    setDeletingTweetId(tweetId);
    setError(null);

    const result = await callApi(tweetId);

    if (!result.success) {
      setError(result.error);
    }

    setDeletingTweetId(null);
    loadingRef.current = false;
    return result.success;
  }, []);

  const handleDelete = useCallback(
    (tweetId: string): Promise<boolean> => execute(tweetId),
    [execute],
  );

  return {
    deleteTweet: handleDelete,
    isLoading: deletingTweetId !== null,
    deletingTweetId,
    error,
  };
}
