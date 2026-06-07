import { useUserSearch } from '../hooks/useUserSearch.js';
import SearchForm from '../components/SearchForm.js';
import SearchResults from '../components/SearchResults.js';

function SearchPage() {
  const { users, isLoading, error, hasSearched, search } = useUserSearch();

  return (
    <div>
      <h1 className="border-b border-gray-100 px-4 py-3 text-lg font-bold">Search Users</h1>
      <SearchForm onSearch={search} isLoading={isLoading} />
      <SearchResults users={users} isLoading={isLoading} error={error} hasSearched={hasSearched} />
    </div>
  );
}

export default SearchPage;
