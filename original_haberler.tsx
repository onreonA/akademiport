'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  summary: string;
  published_at: string;
  category: string;
  tags: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  reading_time: number;
  difficulty_level: string;
  is_featured: boolean;
  image_url?: string;
  video_url?: string;
  podcast_url?: string;
  news_experts?: {
    id: string;
    name: string;
    title: string;
    avatar_url?: string;
  };
}
interface Comment {
  id: string;
  content: string;
  user_email: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}
interface Expert {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar_url?: string;
  expertise_areas: string[];
}
const NewsDetailModal = ({
  news,
  isOpen,
  onClose,
  onInteraction,
}: {
  news: News | null;
  isOpen: boolean;
  onClose: () => void;
  onInteraction: (newsId: string, type: string) => void;
}) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    if (isOpen && news?.id) {
      // Haber detaylarını getir
      fetchNewsDetail(news.id);
      // Kullanıcının etkileşimlerini kontrol et
      checkUserInteractions(news.id);
    }
  }, [isOpen, news?.id]);
  const fetchNewsDetail = async (newsId: string) => {
    try {
      const response = await fetch(`/api/news/${newsId}`, {
        headers: {
          'X-User-Email': 'firma@example.com', // Gerçek kullanıcı email'i
        },
      });
      const data = await response.json();
      if (data.success) {
        setComments(data.data.comments || []);
        setRelatedNews(data.data.relatedNews || []);
        setTags(data.data.tags || []);
      }
    } catch (error) {}
  };
  const checkUserInteractions = async (newsId: string) => {
    try {
      const response = await fetch(`/api/news/${newsId}/interactions`, {
        headers: {
          'X-User-Email': 'firma@example.com',
        },
      });
      const data = await response.json();
      if (data.success) {
        const interactions = data.data;
        setIsLiked(
          interactions.some((i: any) => i.interaction_type === 'like')
        );
        setIsSaved(
          interactions.some((i: any) => i.interaction_type === 'save')
        );
      }
    } catch (error) {}
  };
  const handleInteraction = async (type: string) => {
    if (!news) return;
    try {
      const response = await fetch(`/api/news/${news.id}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'firma@example.com',
        },
        body: JSON.stringify({ interaction_type: type }),
      });
      if (response.ok) {
        onInteraction(news.id, type);
        // UI state'i güncelle
        if (type === 'like') {
          setIsLiked(!isLiked);
        } else if (type === 'save') {
          setIsSaved(!isSaved);
        }
      }
    } catch (error) {}
  };
  const handleComment = async () => {
    if (!news || !newComment.trim()) return;
    try {
      const response = await fetch(`/api/news/${news.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'firma@example.com',
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (response.ok) {
        setNewComment('');
        // Yorumları yeniden yükle
        fetchNewsDetail(news.id);
      }
    } catch (error) {}
  };
  if (!isOpen || !news) return null;
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'e-ihracat':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'e-ticaret':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'eğitim':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'teknik güncelleme':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'duyuru':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'proje':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'pazaryeri':
        return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'dijital pazarlama':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'lojistik':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'regülasyon':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Başlangıç':
        return 'bg-green-100 text-green-800';
      case 'Orta':
        return 'bg-yellow-100 text-yellow-800';
      case 'İleri':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          {/* Header */}
          <div className='flex justify-between items-start mb-6'>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-3'>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(news.category)}`}
                >
                  {news.category}
                </span>
                {news.is_featured && (
                  <span className='px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200'>
                    Öne Çıkan
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(news.difficulty_level)}`}
                >
                  {news.difficulty_level}
                </span>
                {news.reading_time && (
                  <span className='px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'>
                    {news.reading_time} dk okuma
                  </span>
                )}
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                {news.title}
              </h2>
              {news.news_experts && (
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 font-medium text-sm'>
                      {news.news_experts.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      {news.news_experts.name}
                    </p>
                    <p className='text-xs text-gray-600'>
                      {news.news_experts.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
          {/* Content */}
          <div className='prose max-w-none mb-6'>
            <div className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
              {news.content}
            </div>
          </div>
          {/* Tags */}
          {tags.length > 0 && (
            <div className='mb-6'>
              <h4 className='text-sm font-medium text-gray-900 mb-2'>
                Etiketler:
              </h4>
              <div className='flex flex-wrap gap-2'>
                {tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className='px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Interaction Buttons */}
          <div className='flex items-center gap-4 mb-6 pb-4 border-b'>
            <button
              onClick={() => handleInteraction('like')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg
                className='w-5 h-5'
                fill={isLiked ? 'currentColor' : 'none'}
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
              </svg>
              <span>{news.like_count}</span>
            </button>
            <button
              onClick={() => handleInteraction('save')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg
                className='w-5 h-5'
                fill={isSaved ? 'currentColor' : 'none'}
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                />
              </svg>
              <span>Kaydet</span>
            </button>
            <button
              onClick={() => handleInteraction('share')}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                />
              </svg>
              <span>Paylaş</span>
            </button>
          </div>
          {/* Comments */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold text-gray-900 mb-4'>
              Yorumlar ({comments.length})
            </h4>
            {/* Add Comment */}
            <div className='mb-4'>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder='Yorumunuzu yazın...'
                className='w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                rows={3}
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                className='mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Yorum Ekle
              </button>
            </div>
            {/* Comments List */}
            <div className='space-y-4'>
              {comments.map(comment => (
                <div key={comment.id} className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-blue-600 font-medium text-sm'>
                        {comment.user_email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {comment.user_email}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {new Date(comment.created_at).toLocaleDateString(
                          'tr-TR'
                        )}
                      </p>
                    </div>
                  </div>
                  <p className='text-gray-700'>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Related News */}
          {relatedNews.length > 0 && (
            <div>
              <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                İlgili Haberler
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {relatedNews.map(related => (
                  <div
                    key={related.id}
                    className='bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors'
                  >
                    <h5 className='font-medium text-gray-900 mb-2 line-clamp-2'>
                      {related.title}
                    </h5>
                    <p className='text-sm text-gray-600 line-clamp-2'>
                      {related.excerpt}
                    </p>
                    <div className='flex items-center gap-2 mt-2'>
                      <span className='text-xs text-gray-500'>
                        {related.view_count} görüntülenme
                      </span>
                      <span className='text-xs text-gray-500'>•</span>
                      <span className='text-xs text-gray-500'>
                        {related.reading_time} dk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default function NewsPage() {
  const { user, isFirma } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFeatured, setShowFeatured] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    // Firma sayfasında otomatik olarak firma kullanıcısı olarak giriş yap
    if (!user) {
      // login('firma@example.com', 'firma'); // Commented out - login function not available
    }
    fetchNews();
    fetchCategories();
    fetchExperts();
  }, [
    user,
    // login, // Commented out - login function not available
    selectedCategory,
    selectedExpert,
    selectedDifficulty,
    searchTerm,
    sortBy,
    sortOrder,
    showFeatured,
    currentPage,
  ]);
  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      });
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedExpert) params.append('expert', selectedExpert);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (searchTerm) params.append('search', searchTerm);
      if (showFeatured) params.append('featured', 'true');
      const response = await fetch(`/api/news?${params}`, {
        headers: {
          'X-User-Email': user?.email || 'firma@example.com',
        },
      });
      const data = await response.json();
      if (data.success) {
        setNews(data.data.news);
        setTotalPages(data.data.pagination.totalPages);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/news/categories?active=true');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {}
  };
  const fetchExperts = async () => {
    try {
      const response = await fetch('/api/news/experts?active=true');
      const data = await response.json();
      if (data.success) {
        setExperts(data.data);
      }
    } catch (error) {}
  };
  const handleNewsClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };
  const handleInteraction = (newsId: string, type: string) => {
    // Haber listesini güncelle
    setNews(prevNews =>
      prevNews.map(item => {
        if (item.id === newsId) {
          if (type === 'like') {
            return { ...item, like_count: item.like_count + 1 };
          }
          return item;
        }
        return item;
      })
    );
  };
  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(c => c.name === category);
    return categoryData ? categoryData.color : '#6B7280';
  };
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Başlangıç':
        return 'bg-green-100 text-green-800';
      case 'Orta':
        return 'bg-yellow-100 text-yellow-800';
      case 'İleri':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'
                >
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
                  <div className='h-6 bg-gray-200 rounded w-full mb-2'></div>
                  <div className='h-4 bg-gray-200 rounded w-2/3 mb-4'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Haberler</h1>
          <p className='text-gray-600'>
            E-ihracat ve e-ticaret dünyasından en güncel haberler
          </p>
        </div>
        {/* Filters */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Search */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Arama
              </label>
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder='Haber ara...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            {/* Category Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Expert Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Uzman
              </label>
              <select
                value={selectedExpert}
                onChange={e => setSelectedExpert(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Tüm Uzmanlar</option>
                {experts.map(expert => (
                  <option key={expert.id} value={expert.id}>
                    {expert.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Difficulty Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Zorluk
              </label>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Tüm Seviyeler</option>
                <option value='Başlangıç'>Başlangıç</option>
                <option value='Orta'>Orta</option>
                <option value='İleri'>İleri</option>
              </select>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-4 mt-4 pt-4 border-t'>
            {/* Sort */}
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                Sırala:
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='created_at'>En Yeni</option>
                <option value='published'>Yayın Tarihi</option>
                <option value='popular'>En Popüler</option>
                <option value='likes'>En Çok Beğenilen</option>
                <option value='comments'>En Çok Yorumlanan</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className='p-1 text-gray-400 hover:text-gray-600'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                  />
                </svg>
              </button>
            </div>
            {/* Featured Toggle */}
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={showFeatured}
                onChange={e => setShowFeatured(e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700'>Sadece öne çıkanlar</span>
            </label>
            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedExpert('');
                setSelectedDifficulty('');
                setSearchTerm('');
                setShowFeatured(false);
                setSortBy('created_at');
                setSortOrder('desc');
                setCurrentPage(1);
              }}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
        {/* News Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {news.map(newsItem => (
            <div
              key={newsItem.id}
              onClick={() => handleNewsClick(newsItem)}
              className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow'
            >
              {/* Header */}
              <div className='flex items-center gap-2 mb-3'>
                <span
                  className='px-3 py-1 rounded-full text-sm font-medium border'
                  style={{
                    backgroundColor: getCategoryColor(newsItem.category) + '20',
                    color: getCategoryColor(newsItem.category),
                    borderColor: getCategoryColor(newsItem.category) + '40',
                  }}
                >
                  {newsItem.category}
                </span>
                {newsItem.is_featured && (
                  <span className='px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200'>
                    Öne Çıkan
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(newsItem.difficulty_level)}`}
                >
                  {newsItem.difficulty_level}
                </span>
              </div>
              {/* Title */}
              <h3 className='text-lg font-semibold text-gray-900 mb-3 line-clamp-2'>
                {newsItem.title}
              </h3>
              {/* Excerpt */}
              <p className='text-gray-600 mb-4 line-clamp-3'>
                {newsItem.excerpt || newsItem.summary}
              </p>
              {/* Expert Info */}
              {newsItem.news_experts && (
                <div className='flex items-center gap-2 mb-4'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 font-medium text-xs'>
                      {newsItem.news_experts.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      {newsItem.news_experts.name}
                    </p>
                    <p className='text-xs text-gray-600'>
                      {newsItem.news_experts.title}
                    </p>
                  </div>
                </div>
              )}
              {/* Tags */}
              {newsItem.tags && newsItem.tags.length > 0 && (
                <div className='flex flex-wrap gap-1 mb-4'>
                  {newsItem.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'
                    >
                      {tag}
                    </span>
                  ))}
                  {newsItem.tags.length > 3 && (
                    <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
                      +{newsItem.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              {/* Footer */}
              <div className='flex items-center justify-between text-sm text-gray-500'>
                <div className='flex items-center gap-4'>
                  <span className='flex items-center gap-1'>
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                    {newsItem.view_count}
                  </span>
                  <span className='flex items-center gap-1'>
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                      />
                    </svg>
                    {newsItem.like_count}
                  </span>
                  <span className='flex items-center gap-1'>
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                      />
                    </svg>
                    {newsItem.comment_count}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  {newsItem.reading_time && (
                    <span className='flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      {newsItem.reading_time} dk
                    </span>
                  )}
                  <span>
                    {new Date(newsItem.published_at).toLocaleDateString(
                      'tr-TR'
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center mt-8'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Önceki
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className='px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
        {/* Modal */}
        <NewsDetailModal
          news={selectedNews}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onInteraction={handleInteraction}
        />
      </div>
    </div>
  );
}
