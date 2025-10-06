'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';
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
  avatar_url?: string;
  bio: string;
  expertise_areas: string[];
}
export default function HaberlerPage() {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>(
    'latest'
  );
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState('');
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set());
  const [bookmarkedNews, setBookmarkedNews] = useState<Set<string>>(new Set());
  const { signIn } = useAuthStore();
  // Mock data for demonstration
  const mockNews: News[] = [
    {
      id: '1',
      title: 'E-ihracat Sektöründe Yeni Dönem: Dijital Dönüşüm',
      content: 'E-ihracat sektöründe yaşanan dijital dönüşüm...',
      excerpt:
        'E-ihracat sektöründe yaşanan dijital dönüşüm hakkında detaylı analiz.',
      summary: 'Dijital dönüşüm e-ihracat sektörünü nasıl etkiliyor?',
      published_at: '2024-01-15T10:00:00Z',
      category: 'E-ihracat',
      tags: ['dijital-dönüşüm', 'e-ihracat', 'teknoloji'],
      view_count: 1250,
      like_count: 89,
      comment_count: 23,
      reading_time: 5,
      difficulty_level: 'Orta',
      is_featured: true,
      image_url: '/images/news/digital-transformation.jpg',
      news_experts: {
        id: '1',
        name: 'Dr. Ahmet Yılmaz',
        title: 'E-ihracat Uzmanı',
        avatar_url: '/images/experts/ahmet-yilmaz.jpg',
      },
    },
    {
      id: '2',
      title: 'Amazon Türkiye Pazarına Giriş Stratejileri',
      content: 'Amazon Türkiye pazarına giriş için stratejiler...',
      excerpt: 'Amazon Türkiye pazarına giriş için stratejiler ve ipuçları.',
      summary: 'Amazon Türkiye pazarına nasıl giriş yapılır?',
      published_at: '2024-01-14T14:30:00Z',
      category: 'E-ticaret',
      tags: ['amazon', 'e-ticaret', 'strateji'],
      view_count: 980,
      like_count: 67,
      comment_count: 18,
      reading_time: 7,
      difficulty_level: 'İleri',
      is_featured: false,
      image_url: '/images/news/amazon-turkey.jpg',
    },
    {
      id: '3',
      title: 'Dijital Pazarlama Trendleri 2024',
      content: '2024 yılında dijital pazarlama trendleri...',
      excerpt: '2024 yılında dijital pazarlama trendleri ve öneriler.',
      summary: '2024 dijital pazarlama trendleri neler?',
      published_at: '2024-01-13T09:15:00Z',
      category: 'Dijital Pazarlama',
      tags: ['dijital-pazarlama', 'trendler', '2024'],
      view_count: 756,
      like_count: 45,
      comment_count: 12,
      reading_time: 4,
      difficulty_level: 'Başlangıç',
      is_featured: false,
      image_url: '/images/news/digital-marketing-trends.jpg',
    },
  ];
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'E-ihracat',
      description: 'E-ihracat haberleri',
      icon: 'ri-global-line',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: '2',
      name: 'E-ticaret',
      description: 'E-ticaret haberleri',
      icon: 'ri-shopping-cart-line',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: '3',
      name: 'Dijital Pazarlama',
      description: 'Dijital pazarlama haberleri',
      icon: 'ri-marketing-line',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: '4',
      name: 'Teknoloji',
      description: 'Teknoloji haberleri',
      icon: 'ri-computer-line',
      color: 'bg-orange-100 text-orange-800',
    },
  ];
  const mockExperts: Expert[] = [
    {
      id: '1',
      name: 'Dr. Ahmet Yılmaz',
      title: 'E-ihracat Uzmanı',
      avatar_url: '/images/experts/ahmet-yilmaz.jpg',
      bio: '15 yıllık e-ihracat deneyimi',
      expertise_areas: ['E-ihracat', 'Dijital Dönüşüm', 'Pazar Analizi'],
    },
    {
      id: '2',
      name: 'Elif Kaya',
      title: 'E-ticaret Danışmanı',
      avatar_url: '/images/experts/elif-kaya.jpg',
      bio: 'E-ticaret platformları uzmanı',
      expertise_areas: ['E-ticaret', 'Amazon', 'Shopify'],
    },
  ];
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNews(mockNews);
        setCategories(mockCategories);
        setExperts(mockExperts);
      } catch (err) {
        setError('Haberler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  // Filter news based on category and search
  const filteredNews = news.filter(item => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  // Sort news
  const sortedNews = [...filteredNews].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return (
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
        );
      case 'popular':
        return b.view_count - a.view_count;
      case 'trending':
        return b.like_count - a.like_count;
      default:
        return 0;
    }
  });
  // Handle like
  const handleLike = (newsId: string) => {
    if (likedNews.has(newsId)) {
      setLikedNews(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
        return newSet;
      });
    } else {
      setLikedNews(prev => new Set(prev).add(newsId));
    }
  };
  // Handle bookmark
  const handleBookmark = (newsId: string) => {
    if (bookmarkedNews.has(newsId)) {
      setBookmarkedNews(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
        return newSet;
      });
    } else {
      setBookmarkedNews(prev => new Set(prev).add(newsId));
    }
  };
  // Handle comment
  const handleComment = (newsId: string) => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        user_email: 'user@example.com',
        likes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setComments(prev => ({
        ...prev,
        [newsId]: [...(prev[newsId] || []), comment],
      }));
      setNewComment('');
    }
  };
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Haberler'
        description='Sektör haberlerini ve güncel gelişmeleri takip edin'
      >
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
      </FirmaLayout>
    );
  }
  if (error) {
    return (
      <FirmaLayout
        title='Haberler'
        description='Sektör haberlerini ve güncel gelişmeleri takip edin'
      >
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-error-warning-line text-red-600 text-2xl'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Hata Oluştu
            </h3>
            <p className='text-gray-500 mb-6'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Haberler'
      description='Sektör haberlerini ve güncel gelişmeleri takip edin'
    >
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Haberler 📰
              </h1>
              <p className='text-gray-600'>
                E-ihracat ve e-ticaret dünyasından en güncel haberler
              </p>
            </div>
          </div>
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
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Haber ara...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Sort */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sıralama
              </label>
              <select
                value={sortBy}
                onChange={e =>
                  setSortBy(e.target.value as 'latest' | 'popular' | 'trending')
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='latest'>En Yeni</option>
                <option value='popular'>En Popüler</option>
                <option value='trending'>Trend</option>
              </select>
            </div>
            {/* Results Count */}
            <div className='flex items-end'>
              <div className='text-sm text-gray-600'>
                {sortedNews.length} haber bulundu
              </div>
            </div>
          </div>
        </div>
        {/* News Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {sortedNews.map(item => (
            <div
              key={item.id}
              className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'
            >
              {/* Image */}
              {item.image_url && (
                <div className='aspect-video bg-gray-200'>
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={400}
                    height={225}
                    className='w-full h-full object-cover'
                  />
                </div>
              )}
              {/* Content */}
              <div className='p-6'>
                {/* Category */}
                <div className='flex items-center gap-2 mb-3'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${categories.find(c => c.name === item.category)?.color || 'bg-gray-100 text-gray-800'}`}
                  >
                    {item.category}
                  </span>
                  {item.is_featured && (
                    <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium'>
                      Öne Çıkan
                    </span>
                  )}
                </div>
                {/* Title */}
                <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
                  {item.title}
                </h3>
                {/* Excerpt */}
                <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                  {item.excerpt}
                </p>
                {/* Meta */}
                <div className='flex items-center justify-between text-xs text-gray-500 mb-4'>
                  <div className='flex items-center gap-4'>
                    <span>
                      <i className='ri-eye-line mr-1'></i>
                      {item.view_count}
                    </span>
                    <span>
                      <i className='ri-time-line mr-1'></i>
                      {item.reading_time} dk
                    </span>
                    <span>
                      <i className='ri-calendar-line mr-1'></i>
                      {formatDate(item.published_at)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.difficulty_level === 'Başlangıç'
                        ? 'bg-green-100 text-green-800'
                        : item.difficulty_level === 'Orta'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.difficulty_level}
                  </span>
                </div>
                {/* Expert */}
                {item.news_experts && (
                  <div className='flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <i className='ri-user-line text-blue-600 text-sm'></i>
                    </div>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {item.news_experts.name}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {item.news_experts.title}
                      </div>
                    </div>
                  </div>
                )}
                {/* Actions */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                        likedNews.has(item.id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <i
                        className={`ri-heart-${likedNews.has(item.id) ? 'fill' : 'line'}`}
                      ></i>
                      {item.like_count + (likedNews.has(item.id) ? 1 : 0)}
                    </button>
                    <button
                      onClick={() =>
                        setShowComments(
                          showComments === item.id ? null : item.id
                        )
                      }
                      className='flex items-center gap-1 px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
                    >
                      <i className='ri-chat-3-line'></i>
                      {item.comment_count + (comments[item.id]?.length || 0)}
                    </button>
                  </div>
                  <button
                    onClick={() => handleBookmark(item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      bookmarkedNews.has(item.id)
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <i
                      className={`ri-bookmark-${bookmarkedNews.has(item.id) ? 'fill' : 'line'}`}
                    ></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* No Results */}
        {sortedNews.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-newspaper-line text-gray-400 text-2xl'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Haber Bulunamadı
            </h3>
            <p className='text-gray-500'>
              Arama kriterlerinize uygun haber bulunamadı.
            </p>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}
