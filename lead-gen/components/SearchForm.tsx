import React, { useState, useCallback, useRef, useEffect } from 'react';
import MapPinIcon from './icons/MapPinIcon';
import SearchIcon from './icons/SearchIcon';
import { getSearchSuggestions } from '../services/geminiService';

interface SearchFormProps {
  onSearch: (query: string, count: number) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [leadCount, setLeadCount] = useState<number | ''>(10);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (currentQuery: string) => {
    if (currentQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const result = await getSearchSuggestions(currentQuery);
      setSuggestions(result);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = window.setTimeout(() => {
      fetchSuggestions(newQuery);
    }, 300);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
      setQuery(suggestion);
      setShowSuggestions(false);
      onSearch(suggestion, leadCount || 10);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    onSearch(query, leadCount || 10);
  };
  
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setLeadCount('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        setLeadCount(Math.max(1, Math.min(50, numValue)));
      }
    }
  };

  const handleGoogleMapsSearch = () => {
    if (!query.trim()) return;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };


  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <div className="relative w-full flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="e.g., coffee shops in Seattle"
          className="w-full pl-10 pr-4 py-3 rounded-md bg-slate-800 border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-200 text-slate-100 placeholder-slate-400"
          disabled={isLoading}
          aria-label="Search query"
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 w-full bg-slate-700 border border-slate-600 rounded-md mt-1 shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li 
                key={i}
                className="px-4 py-2 hover:bg-slate-600 cursor-pointer text-slate-200"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <label htmlFor="lead-count" className="text-slate-400 text-sm whitespace-nowrap"># Leads:</label>
        <input
          id="lead-count"
          type="number"
          value={leadCount}
          onChange={handleCountChange}
          min="1"
          max="50"
          className="w-20 px-3 py-3 rounded-md bg-slate-800 border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-200 text-slate-100"
          disabled={isLoading}
          aria-label="Number of leads"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center w-full sm:w-auto"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
              <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
              </>
          ) : 'Find Leads'}
        </button>
        <button
            type="button"
            onClick={handleGoogleMapsSearch}
            className="p-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold rounded-md transition duration-200 flex items-center justify-center"
            disabled={!query.trim()}
            aria-label="Search on Google Maps"
            title="Search on Google Maps"
        >
            <MapPinIcon />
        </button>
      </div>
    </form>
  );
};

export default SearchForm;