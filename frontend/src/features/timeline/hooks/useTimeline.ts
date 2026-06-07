import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTimeline } from '../api/timelineApi.js';
import type { TimelineTweet } from '../types/timeline.types.js';

interface UseTimelineResult {
  tweets: TimelineTweet[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  removeTweet: (tweetId: string) => void;
}

export function useTimeline(page: number, limit: number): UseTimelineResult {
  const [tweets, setTweets] = useState<TimelineTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (!hasLoadedOnce.current) {
      setIsLoading(true);
    }
    setError(null);

    fetchTimeline(page, limit)
      .then((result) => {
        if (!cancelled) {
          setTweets(result.data);
          hasLoadedOnce.current = true;
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err && typeof err === 'object' && 'response' in err
              ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
                'Failed to load timeline')
              : 'Failed to load timeline';
          setError(message);
          hasLoadedOnce.current = true;
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, refreshCounter]);

  const refresh = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  const removeTweet = useCallback((tweetId: string) => {
    setTweets((prev) => prev.filter((t) => t.id !== tweetId));
  }, []);

  return { tweets, isLoading, error, refresh, removeTweet };
}
