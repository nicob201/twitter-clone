import type { SearchUser } from '../types/user-search.types.js';

interface SearchResultsProps {
  users: SearchUser[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

function SearchResults({ users, isLoading, error, hasSearched }: SearchResultsProps) {
  if (isLoading) {
    return <div data-testid="loading-state">Searching...</div>;
  }

  if (error) {
    return (
      <div data-testid="error-state" className="text-red-500">
        {error}
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  if (users.length === 0) {
    return <div data-testid="empty-state">No users found matching your query.</div>;
  }

  return (
    <ul data-testid="results-state" className="space-y-2">
      {users.map((user) => (
        <li key={user.id} className="rounded border p-3">
          <p className="font-medium">{user.username}</p>
          <p className="text-sm text-gray-500">ID: {user.id}</p>
        </li>
      ))}
    </ul>
  );
}

export default SearchResults;
