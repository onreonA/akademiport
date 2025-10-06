'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

import GlobalSearch from '@/components/ui/GlobalSearch';
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
function SearchPageContent() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTypes = [
    { value: 'all', label: 'Tümü', icon: 'ri-search-line' },
    { value: 'companies', label: 'Firmalar', icon: 'ri-building-line' },
    { value: 'projects', label: 'Projeler', icon: 'ri-project-line' },
    { value: 'documents', label: 'Belgeler', icon: 'ri-file-line' },
    { value: 'events', label: 'Etkinlikler', icon: 'ri-calendar-line' },
    { value: 'news', label: 'Haberler', icon: 'ri-newspaper-line' },
  ];
  // Perform search
  const performSearch = async (query: string, type: string = 'all') => {
    if (query.trim().length < 2) {
      setResults([]);
      setSuggestions([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    try {
      const params = new URLSearchParams({
        q: query,
        type: type,
        limit: '50',
      });
      const response = await fetch(`/api/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data: { success: boolean; data: SearchResponse } =
          await response.json();
        if (data.success) {
          setResults(data.data.results);
          setSuggestions(data.data.suggestions);
          setTotal(data.data.total);
        } else {
          setError((data as any).error || 'Arama sırasında hata oluştu');
        }
      } else {
        setError('Arama sırasında hata oluştu');
      }
    } catch (error) {
      setError('Arama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  // Handle search from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    if (query) {
      setSelectedType(type);
      performSearch(query, type);
    }
  }, [searchParams]);
  // Handle type filter change
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (currentQuery) {
      performSearch(currentQuery, type);
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('type', type);
      router.push(`/arama?${params.toString()}`);
    }
  };
  // Handle search from GlobalSearch component
  const handleSearch = (query: string) => {
    const params = new URLSearchParams({ q: query });
    if (selectedType !== 'all') {
      params.set('type', selectedType);
    }
    router.push(`/arama?${params.toString()}`);
  };
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
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Arama</h1>
              <p className='text-gray-600 mt-1'>Sistem genelinde arama yapın</p>
            </div>
          </div>
          {/* Search Bar */}
          <div className='mt-6'>
            <GlobalSearch
              placeholder='Ne aramak istiyorsunuz?'
              className='w-full max-w-2xl'
              maxResults={10}
              onResultClick={result => router.push(result.url)}
            />
          </div>
          {/* Type Filters */}
          {currentQuery && (
            <div className='mt-4'>
              <div className='flex flex-wrap gap-2'>
                {searchTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeChange(type.value)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className={`${type.icon} mr-2`}></i>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Results */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {currentQuery && (
          <div className='mb-6'>
            <p className='text-gray-600'>
              <span className='font-medium'>&quot;{currentQuery}&quot;</span>{' '}
              için <span className='font-medium'>{total}</span> sonuç bulundu
            </p>
          </div>
        )}
        {/* Loading */}
        {loading && (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <span className='ml-3 text-gray-600'>Aranıyor...</span>
          </div>
        )}
        {/* Error */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <i className='ri-error-warning-line text-red-400'></i>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <div className='space-y-4'>
            {results.map(result => (
              <div
                key={result.id}
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => router.push(result.url)}
              >
                <div className='flex items-start space-x-4'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(result.type)}`}
                  >
                    <i className={`${getTypeIcon(result.type)} text-lg`}></i>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-medium text-gray-900 mb-1'>
                      {result.title}
                    </h3>
                    <p className='text-gray-600 mb-2'>{result.description}</p>
                    <div className='flex items-center space-x-4 text-sm text-gray-500'>
                      <span className='capitalize'>{result.type}</span>
                      {result.metadata.created_at && (
                        <span>{formatDate(result.metadata.created_at)}</span>
                      )}
                      {result.metadata.company && (
                        <span>{result.metadata.company}</span>
                      )}
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <i className='ri-arrow-right-s-line text-gray-400'></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* No Results */}
        {!loading && !error && currentQuery && results.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <i className='ri-search-line text-2xl text-gray-400'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Sonuç bulunamadı
            </h3>
            <p className='text-gray-600 mb-4'>
              &quot;{currentQuery}&quot; için hiç sonuç bulunamadı. Farklı
              anahtar kelimeler deneyin.
            </p>
            {suggestions.length > 0 && (
              <div>
                <p className='text-sm text-gray-500 mb-2'>Öneriler:</p>
                <div className='flex flex-wrap justify-center gap-2'>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors'
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Initial State */}
        {!currentQuery && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4'>
              <i className='ri-search-line text-2xl text-blue-600'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Arama yapmaya başlayın
            </h3>
            <p className='text-gray-600'>
              Yukarıdaki arama kutusunu kullanarak sistem genelinde arama
              yapabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-gray-600'>Arama sayfası yükleniyor...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
