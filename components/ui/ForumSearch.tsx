'use client';
import { useEffect, useState } from 'react';
interface ForumCategory {
  id: string;
  name: string;
  color: string;
}
interface ForumSearchProps {
  categories: ForumCategory[];
  onSearch: (filters: any) => void;
  onSort: (sortBy: string, order: string) => void;
}
const ForumSearch = ({ categories, onSearch, onSort }: ForumSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'active', label: 'Aktif' },
    { value: 'pinned', label: 'Sabitlenmiş' },
    { value: 'solved', label: 'Çözüldü' },
    { value: 'featured', label: 'Öne Çıkan' },
  ];
  const sortOptions = [
    { value: 'created_at', label: 'Oluşturulma Tarihi' },
    { value: 'updated_at', label: 'Güncellenme Tarihi' },
    { value: 'view_count', label: 'Görüntülenme Sayısı' },
    { value: 'reply_count', label: 'Yanıt Sayısı' },
    { value: 'like_count', label: 'Beğeni Sayısı' },
    { value: 'title', label: 'Başlık' },
  ];
  const popularTags = [
    'e-ihracat',
    'pazaryeri',
    'dijital-pazarlama',
    'sosyal-medya',
    'google-ads',
    'facebook-ads',
    'seo',
    'analytics',
    'mobil',
    'uygulama',
    'entegrasyon',
    'api',
    'teknik-destek',
    'eğitim',
  ];
  useEffect(() => {
    const filters = {
      search: searchQuery,
      category: selectedCategory,
      status: selectedStatus,
      tags: selectedTags,
    };
    onSearch(filters);
  }, [searchQuery, selectedCategory, selectedStatus, selectedTags]);
  useEffect(() => {
    onSort(sortBy, sortOrder);
  }, [sortBy, sortOrder]);
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedTags([]);
    setSortBy('created_at');
    setSortOrder('desc');
  };
  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedStatus ||
    selectedTags.length > 0;
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
      {/* Basic Search */}
      <div className='flex items-center gap-4 mb-4'>
        <div className='flex-1 relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
            <i className='ri-search-line text-gray-400 text-sm'></i>
          </div>
          <input
            type='text'
            placeholder='Konu başlığı, içerik veya etiketlerde arama yapın...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className='px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2'
        >
          <i className={`ri-filter-${showAdvanced ? 'off' : 'line'}`}></i>
          {showAdvanced ? 'Basit Arama' : 'Gelişmiş Arama'}
        </button>
      </div>
      {/* Advanced Filters */}
      {showAdvanced && (
        <div className='space-y-4 border-t border-gray-100 pt-4'>
          {/* Category and Status */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                <option value=''>Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Durum
              </label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Tags */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Popüler Etiketler
            </label>
            <div className='flex flex-wrap gap-2'>
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
          {/* Sort Options */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sıralama Kriteri
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sıralama Yönü
              </label>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                <option value='desc'>Azalan (Yeni → Eski)</option>
                <option value='asc'>Artan (Eski → Yeni)</option>
              </select>
            </div>
          </div>
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-sm font-medium text-blue-800'>
                  Aktif Filtreler:
                </span>
                {searchQuery && (
                  <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                    Arama: &quot;{searchQuery}&quot;
                    <button
                      onClick={() => setSearchQuery('')}
                      className='hover:text-blue-600'
                    >
                      <i className='ri-close-line text-xs'></i>
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                    Kategori:{' '}
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className='hover:text-blue-600'
                    >
                      <i className='ri-close-line text-xs'></i>
                    </button>
                  </span>
                )}
                {selectedStatus && (
                  <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                    Durum:{' '}
                    {statusOptions.find(s => s.value === selectedStatus)?.label}
                    <button
                      onClick={() => setSelectedStatus('')}
                      className='hover:text-blue-600'
                    >
                      <i className='ri-close-line text-xs'></i>
                    </button>
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                  >
                    #{tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className='hover:text-blue-600'
                    >
                      <i className='ri-close-line text-xs'></i>
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={clearFilters}
                className='text-sm text-blue-600 hover:text-blue-800 font-medium'
              >
                Tümünü Temizle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ForumSearch;
