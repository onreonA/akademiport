'use client';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
interface SearchResult {
  id: string;
  type: 'company' | 'project' | 'document' | 'event' | 'news';
  title: string;
  description: string;
  url: string;
  metadata: any;
}
interface SearchResponse {
  results: SearchResult[];
  total: number;
  suggestions: string[];
  query: string;
  type: string;
}
interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
  showSuggestions?: boolean;
  maxResults?: number;
}
export default function GlobalSearch({
  placeholder = 'Sistem genelinde ara...',
  className = '',
  onResultClick,
  showSuggestions = true,
  maxResults = 10,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {}
    }
  }, []);
  // Save search history to localStorage
  const saveSearchHistory = useCallback(
    (searchTerm: string) => {
      if (searchTerm.trim().length < 2) return;
      const newHistory = [
        searchTerm,
        ...searchHistory.filter(item => item !== searchTerm),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
    },
    [searchHistory]
  );
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.trim().length < 2) {
        setResults([]);
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}&limit=${maxResults}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.ok) {
          const data: { success: boolean; data: SearchResponse } =
            await response.json();
          if (data.success) {
            setResults(data.data.results);
            setSuggestions(data.data.suggestions);
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [maxResults]
  );
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    if (value.trim().length >= 2) {
      setIsOpen(true);
      debouncedSearch(value);
    } else {
      setIsOpen(false);
      setResults([]);
      setSuggestions([]);
    }
  };
  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    saveSearchHistory(query);
    setIsOpen(false);
    setQuery('');
    if (onResultClick) {
      onResultClick(result);
    } else {
      router.push(result.url);
    }
  };
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(true);
    debouncedSearch(suggestion);
    inputRef.current?.focus();
  };
  // Handle history click
  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    setIsOpen(true);
    debouncedSearch(historyItem);
    inputRef.current?.focus();
  };
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    const totalItems =
      results.length +
      (showSuggestions ? suggestions.length : 0) +
      searchHistory.length;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < results.length) {
            handleResultClick(results[selectedIndex]);
          } else if (selectedIndex < results.length + suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex - results.length]);
          } else {
            handleHistoryClick(
              searchHistory[selectedIndex - results.length - suggestions.length]
            );
          }
        } else if (query.trim().length >= 2) {
          saveSearchHistory(query);
          // Navigate to first result or show all results
          if (results.length > 0) {
            handleResultClick(results[0]);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Get type icon
  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      company: 'ri-building-line',
      project: 'ri-project-line',
      document: 'ri-file-line',
      event: 'ri-calendar-line',
      news: 'ri-newspaper-line',
    };
    return iconMap[type] || 'ri-search-line';
  };
  // Get type color
  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      company: 'text-blue-600 bg-blue-100',
      project: 'text-green-600 bg-green-100',
      document: 'text-purple-600 bg-purple-100',
      event: 'text-orange-600 bg-orange-100',
      news: 'text-red-600 bg-red-100',
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <i className='ri-search-line text-gray-400'></i>
        </div>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2 || searchHistory.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
        />
        {isLoading && (
          <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
          </div>
        )}
      </div>
      {/* Search Results Dropdown */}
      {isOpen && (
        <div className='absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto'>
          {/* Search Results */}
          {results.length > 0 && (
            <div className='p-2'>
              <div className='text-xs font-medium text-gray-500 mb-2 px-2'>
                Sonuçlar ({results.length})
              </div>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getTypeColor(result.type)}`}
                  >
                    <i className={`${getTypeIcon(result.type)} text-sm`}></i>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium text-gray-900 truncate'>
                      {result.title}
                    </div>
                    <div className='text-xs text-gray-500 truncate'>
                      {result.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className='p-2 border-t border-gray-100'>
              <div className='text-xs font-medium text-gray-500 mb-2 px-2'>
                Öneriler
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedIndex === results.length + index
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <i className='ri-lightbulb-line text-gray-400 mr-3'></i>
                  <span className='text-sm text-gray-700'>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
          {/* Search History */}
          {query.trim().length < 2 && searchHistory.length > 0 && (
            <div className='p-2 border-t border-gray-100'>
              <div className='text-xs font-medium text-gray-500 mb-2 px-2'>
                Son Aramalar
              </div>
              {searchHistory.slice(0, 5).map((historyItem, index) => (
                <div
                  key={historyItem}
                  onClick={() => handleHistoryClick(historyItem)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedIndex ===
                    results.length + suggestions.length + index
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <i className='ri-history-line text-gray-400 mr-3'></i>
                  <span className='text-sm text-gray-700'>{historyItem}</span>
                </div>
              ))}
            </div>
          )}
          {/* No Results */}
          {query.trim().length >= 2 && results.length === 0 && !isLoading && (
            <div className='p-4 text-center text-gray-500'>
              <i className='ri-search-line text-2xl mb-2'></i>
              <p className='text-sm'>
                &quot;{query}&quot; için sonuç bulunamadı
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
