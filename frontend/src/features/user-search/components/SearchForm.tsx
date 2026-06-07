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
    <form onSubmit={handleSubmit} className="border-b border-gray-100 px-4 py-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Search users..."
          className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
