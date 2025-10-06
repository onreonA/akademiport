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
      <div className='max-w-7xl mx-auto'>
        {/* Page Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Forum 💬
              </h1>
              <p className='text-gray-600'>
                Diğer firmalarla deneyimlerinizi paylaşın ve sorularınızı sorun
              </p>
            </div>
            {/* Quick Actions */}
            <div className='flex items-center gap-4'>
              <Link href='/firma/forum/yeni-konu'>
                <button className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
                  <i className='ri-add-line'></i>
                  Yeni Konu Aç
                </button>
              </Link>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <i className='ri-chat-3-line text-blue-600 text-xl'></i>
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {topics.length}
                </p>
                <p className='text-sm text-gray-600'>Toplam Konu</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <i className='ri-message-3-line text-green-600 text-xl'></i>
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {topics.reduce((sum, topic) => sum + topic.reply_count, 0)}
                </p>
                <p className='text-sm text-gray-600'>Toplam Yanıt</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <i className='ri-eye-line text-purple-600 text-xl'></i>
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {topics.reduce((sum, topic) => sum + topic.view_count, 0)}
                </p>
                <p className='text-sm text-gray-600'>Toplam Görüntüleme</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                <i className='ri-star-line text-orange-600 text-xl'></i>
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {topics.filter(topic => topic.is_featured).length}
                </p>
                <p className='text-sm text-gray-600'>Öne Çıkan</p>
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
        {/* Search and Filters */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Arama
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                  <i className='ri-search-line text-gray-400'></i>
                </div>
                <input
                  type='text'
                  placeholder='Konu başlığı, içerik veya etiket ara...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sıralama
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  handleSort(newSortBy, newSortOrder);
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='created_at-desc'>En Yeni</option>
                <option value='created_at-asc'>En Eski</option>
                <option value='reply_count-desc'>En Çok Yanıt</option>
                <option value='view_count-desc'>En Çok Görüntüleme</option>
                <option value='like_count-desc'>En Çok Beğeni</option>
              </select>
            </div>
          </div>
        </div>
        {/* Topics List */}
        <div className='space-y-6'>
          {filteredTopics.map(topic => {
            const categoryInfo = getCategoryInfo(topic.category_id);
            return (
              <div
                key={topic.id}
                className='bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                      <i className='ri-chat-3-line text-blue-600'></i>
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        {topic.title}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {topic.users?.full_name || 'Anonim'} tarafından{' '}
                        {getTimeAgo(topic.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {topic.is_featured && (
                      <span className='inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full'>
                        <i className='ri-star-line text-xs'></i>Öne Çıkan
                      </span>
                    )}
                    {topic.is_solved && (
                      <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'>
                        <i className='ri-check-line text-xs'></i>Çözüldü
                      </span>
                    )}
                    {categoryInfo && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 ${categoryInfo.color} text-white text-xs font-medium rounded-full`}
                      >
                        <i className={`${categoryInfo.icon} text-xs`}></i>
                        {categoryInfo.name}
                      </span>
                    )}
                  </div>
                </div>
                <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                  {topic.content}
                </p>
                {/* Tags */}
                {topic.tags && topic.tags.length > 0 && (
                  <div className='flex items-center gap-2 mb-4 flex-wrap'>
                    {topic.tags.map(tag => (
                      <span
                        key={tag}
                        className='inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md'
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {/* Meta */}
                <div className='flex items-center justify-between text-sm text-gray-500'>
                  <div className='flex items-center gap-4'>
                    <span>
                      <i className='ri-user-line mr-1'></i>
                      {topic.users?.full_name || 'Anonim'}
                    </span>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='flex items-center gap-1'>
                      <i className='ri-message-3-line'></i>
                      {topic.reply_count}
                    </span>
                    <span className='flex items-center gap-1'>
                      <i className='ri-eye-line'></i>
                      {topic.view_count}
                    </span>
                    <span className='flex items-center gap-1'>
                      <i className='ri-heart-line'></i>
                      {topic.like_count}
                    </span>
                    <Link href={`/firma/forum/${topic.id}`}>
                      <button className='text-blue-600 hover:text-blue-800 font-medium cursor-pointer'>
                        Detayları Gör
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredTopics.length === 0 && (
          <div className='p-12 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-search-line text-gray-400 text-2xl'></i>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Sonuç Bulunamadı
            </h3>
            <p className='text-gray-600 mb-4'>
              Arama kriterlerinize uygun konu bulunamadı. Farklı anahtar
              kelimeler deneyin.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className='text-blue-600 hover:text-blue-800 font-medium cursor-pointer'
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
        {/* Forum Rules */}
        <div className='mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6'>
          <div className='flex items-start gap-3'>
            <i className='ri-information-line text-blue-600 text-xl mt-1'></i>
            <div>
              <h4 className='font-semibold text-blue-900 mb-2'>
                Forum Kuralları
              </h4>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>• Saygılı ve yapıcı bir dil kullanın</li>
                <li>• Spam içerik paylaşmayın</li>
                <li>• Konuya uygun kategoride paylaşım yapın</li>
                <li>• Kişisel bilgilerinizi paylaşmayın</li>
                <li>• Ticari reklamlar yasaktır</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
};
export default ForumDashboard;
