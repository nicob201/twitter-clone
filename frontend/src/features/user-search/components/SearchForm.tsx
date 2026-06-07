import { useState } from 'react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Search users..."
          className="flex-1 rounded border border-gray-300 px-3 py-2"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
