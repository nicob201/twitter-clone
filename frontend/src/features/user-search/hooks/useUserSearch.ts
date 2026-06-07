import { useState, useCallback } from 'react';
import { searchUsers } from '../api/userSearchApi.js';
import type { SearchUser } from '../types/user-search.types.js';

interface UseUserSearchResult {
  users: SearchUser[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (query: string) => void;
}

export function useUserSearch(): UseUserSearchResult {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback((query: string) => {
    const trimmed = query.trim();

    if (trimmed.length < 2 || trimmed.length > 50) {
      setError('Query must be between 2 and 50 characters.');
      setUsers([]);
      setHasSearched(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    searchUsers(trimmed)
      .then((result) => {
        setUsers(result);
      })
      .catch((err: unknown) => {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
              'Failed to search users.')
            : 'Failed to search users.';
        setError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { users, isLoading, error, hasSearched, search };
}
