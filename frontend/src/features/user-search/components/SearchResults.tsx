import { Link } from 'react-router-dom';
import type { SearchUser } from '../types/user-search.types.js';

interface SearchResultsProps {
  users: SearchUser[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

function SearchResults({ users, isLoading, error, hasSearched }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center text-gray-500" data-testid="loading-state">
        Searching...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="border-b border-gray-100 px-4 py-3 text-sm text-red-500"
        data-testid="error-state"
      >
        {error}
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  if (users.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500" data-testid="empty-state">
        No users found matching your query.
      </div>
    );
  }

  return (
    <ul data-testid="results-state">
      {users.map((user) => (
        <li key={user.id}>
          <Link
            to={`/profile/${user.id}`}
            className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              {user.username[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-gray-900">{user.username}</p>
              <p className="truncate text-sm text-gray-500">@{user.username}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default SearchResults;
