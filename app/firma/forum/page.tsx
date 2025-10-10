'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  company_id: string;
  status: string;
  is_featured: boolean;
  is_solved: boolean;
  view_count: number;
  reply_count: number;
  like_count: number;
  last_reply_at: string;
  last_reply_by: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  forum_categories?: {
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  users?: {
    email: string;
    full_name: string;
  };
  companies?: {
    name: string;
    email: string;
  };
}
interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  topic_count: number;
  created_at: string;
  updated_at: string;
}
// API fonksiyonları
const fetchCategories = async (): Promise<ForumCategory[]> => {
  try {
    const response = await fetch(
      '/api/forum/categories?is_active=true&sort_by=sort_order&order=asc'
    );
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
const fetchTopics = async (categoryId?: string): Promise<ForumTopic[]> => {
  try {
    let url = '/api/forum/topics?sort_by=created_at&order=desc&limit=50';
    if (categoryId && categoryId !== 'all') {
      url += `&category_id=${categoryId}`;
    }
    const response = await fetch(url);
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
const ForumDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<ForumTopic[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState<string | null>(null);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  // Veri yükleme
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesData, topicsData] = await Promise.all([
          fetchCategories(),
          fetchTopics(),
        ]);
        setCategories(categoriesData);
        setTopics(topicsData);
        setFilteredTopics(topicsData);
      } catch (error) {
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  // Kategori değiştiğinde konuları yeniden yükle
  useEffect(() => {
    const loadTopics = async () => {
      setLoading(true);
      try {
        const topicsData = await fetchTopics(selectedCategory);
        setTopics(topicsData);
        setFilteredTopics(topicsData);
      } catch (error) {
        // Topics fetch error
        setError('Forum konuları yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    if (selectedCategory) {
      loadTopics();
    }
  }, [selectedCategory]);
  // Arama filtreleme ve sıralama
  useEffect(() => {
    let filtered = topics;
    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        topic =>
          topic.title.toLowerCase().includes(query) ||
          topic.content.toLowerCase().includes(query) ||
          (topic.tags &&
            topic.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    // Sıralama
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ForumTopic];
      let bValue: any = b[sortBy as keyof ForumTopic];
      // String değerler için
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    setFilteredTopics(filtered);
  }, [searchQuery, topics, sortBy, sortOrder]);
  // Gelişmiş arama fonksiyonları
  const handleAdvancedSearch = (filters: any) => {
    setSearchQuery(filters.search || '');
    setSelectedCategory(filters.category || 'all');
  };
  const handleSort = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Forum'
        description='Diğer firmalarla deneyimlerinizi paylaşın ve sorularınızı sorun'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Forum yükleniyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Forum'
      description='Diğer firmalarla deneyimlerinizi paylaşın ve sorularınızı sorun'
    >
      <div className='max-w-7xl mx-auto space-y-4'>
        {/* Compact Header with Stats */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                <i className='ri-forum-line text-white text-2xl'></i>
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>Forum</h1>
                <p className='text-blue-100 text-sm'>Toplulukla etkileşim kurun</p>
              </div>
            </div>
            <Link href='/firma/forum/yeni-konu'>
              <button className='px-4 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'>
                <i className='ri-add-line text-lg'></i>
                Yeni Konu
              </button>
            </Link>
          </div>
          
          {/* Compact Stats */}
          <div className='grid grid-cols-4 gap-4'>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20'>
              <div className='flex items-center gap-2'>
                <i className='ri-chat-3-line text-white text-xl'></i>
                <div>
                  <p className='text-2xl font-bold text-white'>{topics.length}</p>
                  <p className='text-xs text-blue-100'>Konu</p>
                </div>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20'>
              <div className='flex items-center gap-2'>
                <i className='ri-message-3-line text-white text-xl'></i>
                <div>
                  <p className='text-2xl font-bold text-white'>
                    {topics.reduce((sum, topic) => sum + topic.reply_count, 0)}
                  </p>
                  <p className='text-xs text-blue-100'>Yanıt</p>
                </div>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20'>
              <div className='flex items-center gap-2'>
                <i className='ri-eye-line text-white text-xl'></i>
                <div>
                  <p className='text-2xl font-bold text-white'>
                    {topics.reduce((sum, topic) => sum + topic.view_count, 0)}
                  </p>
                  <p className='text-xs text-blue-100'>Görüntüleme</p>
                </div>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20'>
              <div className='flex items-center gap-2'>
                <i className='ri-star-line text-white text-xl'></i>
                <div>
                  <p className='text-2xl font-bold text-white'>
                    {topics.filter(topic => topic.is_featured).length}
                  </p>
                  <p className='text-xs text-blue-100'>Öne Çıkan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center gap-2'>
              <i className='ri-error-warning-line text-red-500'></i>
              <span className='text-red-700 font-medium'>{error}</span>
              <button
                onClick={() => setError(null)}
                className='ml-auto text-red-500 hover:text-red-700'
              >
                <i className='ri-close-line'></i>
              </button>
            </div>
          </div>
        )}
        {/* Compact Search and Filters */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
          <div className='flex flex-wrap items-center gap-3'>
            {/* Search Bar */}
            <div className='flex-1 min-w-[280px]'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <i className='ri-search-line text-gray-400'></i>
                </div>
                <input
                  type='text'
                  placeholder='Konu ara...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all'
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className='flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5'>
              <i className='ri-folder-line text-gray-500'></i>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer pr-8'
              >
                <option value='all'>Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort Filter */}
            <div className='flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5'>
              <i className='ri-sort-desc text-gray-500'></i>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  handleSort(newSortBy, newSortOrder);
                }}
                className='bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer pr-8'
              >
                <option value='created_at-desc'>En Yeni</option>
                <option value='created_at-asc'>En Eski</option>
                <option value='reply_count-desc'>En Çok Yanıt</option>
                <option value='view_count-desc'>En Çok Görüntüleme</option>
                <option value='like_count-desc'>En Çok Beğeni</option>
              </select>
            </div>
            
            {/* View Mode Toggle */}
            <div className='flex items-center gap-1 bg-gray-50 rounded-lg p-1'>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className='ri-list-unordered'></i>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className='ri-grid-line'></i>
              </button>
            </div>
          </div>
        </div>
        {/* Modern Topics List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
          {filteredTopics.map(topic => {
            const categoryInfo = getCategoryInfo(topic.category_id);
            return (
              <Link key={topic.id} href={`/firma/forum/${topic.id}`}>
                <div className='bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer group'>
                  {/* Header */}
                  <div className='flex items-start gap-3 mb-3'>
                    <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'>
                      <i className='ri-chat-3-line text-white text-lg'></i>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2 mb-1'>
                        <h3 className='text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1'>
                          {topic.title}
                        </h3>
                        <div className='flex items-center gap-1 flex-shrink-0'>
                          {topic.is_featured && (
                            <span className='inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full' title='Öne Çıkan'>
                              <i className='ri-star-fill text-xs'></i>
                            </span>
                          )}
                          {topic.is_solved && (
                            <span className='inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full' title='Çözüldü'>
                              <i className='ri-check-line text-xs'></i>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className='text-xs text-gray-500 mb-2'>
                        <i className='ri-user-line mr-1'></i>
                        {topic.users?.full_name || 'Anonim'} • {getTimeAgo(topic.created_at)}
                      </p>
                      <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
                        {topic.content}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className='flex items-center gap-1.5 mb-3 flex-wrap'>
                      {topic.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className='inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors'
                        >
                          #{tag}
                        </span>
                      ))}
                      {topic.tags.length > 3 && (
                        <span className='text-xs text-gray-400'>+{topic.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                    <div className='flex items-center gap-1'>
                      {categoryInfo && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 ${categoryInfo.color} bg-opacity-10 text-xs font-medium rounded-lg`}>
                          <i className={`${categoryInfo.icon} text-xs`}></i>
                          <span className='text-gray-700'>{categoryInfo.name}</span>
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                      <span className='flex items-center gap-1 hover:text-blue-600 transition-colors'>
                        <i className='ri-message-3-line'></i>
                        {topic.reply_count}
                      </span>
                      <span className='flex items-center gap-1 hover:text-blue-600 transition-colors'>
                        <i className='ri-eye-line'></i>
                        {topic.view_count}
                      </span>
                      <span className='flex items-center gap-1 hover:text-blue-600 transition-colors'>
                        <i className='ri-heart-line'></i>
                        {topic.like_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {filteredTopics.length === 0 && (
          <div className='bg-white rounded-xl border border-gray-100 p-12 text-center'>
            <div className='w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <i className='ri-inbox-line text-gray-400 text-3xl'></i>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>
              Henüz Konu Yok
            </h3>
            <p className='text-gray-600 mb-6 max-w-md mx-auto'>
              {searchQuery || selectedCategory !== 'all'
                ? 'Arama kriterlerinize uygun konu bulunamadı. Farklı filtreler deneyin.'
                : 'Topluluğa ilk konuyu siz açın ve tartışmayı başlatın!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors'
              >
                <i className='ri-restart-line'></i>
                Filtreleri Sıfırla
              </button>
            )}
          </div>
        )}
        
        {/* Compact Forum Rules */}
        {filteredTopics.length > 0 && (
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                <i className='ri-shield-check-line text-blue-600 text-lg'></i>
              </div>
              <div className='flex-1'>
                <h4 className='font-semibold text-blue-900 mb-2 text-sm'>
                  Forum Kuralları
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-blue-800'>
                  <div className='flex items-center gap-2'>
                    <i className='ri-checkbox-circle-fill text-blue-600'></i>
                    <span>Saygılı ve yapıcı dil kullanın</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-checkbox-circle-fill text-blue-600'></i>
                    <span>Spam içerik paylaşmayın</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-checkbox-circle-fill text-blue-600'></i>
                    <span>Doğru kategoride paylaşım yapın</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-checkbox-circle-fill text-blue-600'></i>
                    <span>Kişisel bilgi paylaşmayın</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-checkbox-circle-fill text-blue-600'></i>
                    <span>Ticari reklam yasaktır</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-checkbox-circle-fill text-blue-600'></i>
                    <span>Topluluk yönergelerine uyun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
};
export default ForumDashboard;
