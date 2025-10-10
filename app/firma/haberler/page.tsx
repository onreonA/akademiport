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
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState('');
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set());
  const [bookmarkedNews, setBookmarkedNews] = useState<Set<string>>(new Set());
  const { signIn, user } = useAuthStore();

  // Mock data for demonstration
  const mockNews: News[] = [
    {
      id: '1',
      title: 'E-ihracat Sektöründe Yeni Dönem: Dijital Dönüşüm',
      content: 'E-ihracat sektöründe yaşanan dijital dönüşüm...',
      excerpt: 'E-ihracat sektöründe yaşanan dijital dönüşüm hakkında detaylı analiz.',
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

        // Get user email for authentication
        const userEmail = user?.email || '';

        // Fetch real data from API with authentication
        const [newsResponse, categoriesResponse, expertsResponse] = await Promise.all([
          fetch('/api/news', {
        headers: {
              'X-User-Email': userEmail,
            },
          }),
          fetch('/api/news/categories'),
          fetch('/api/news/experts'),
        ]);

        const newsData = await newsResponse.json();
        const categoriesData = await categoriesResponse.json();
        const expertsData = await expertsResponse.json();

        if (newsData.success) {
          setNews(newsData.data.news);
        } else {
          setNews(mockNews); // Fallback to mock data
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        } else {
          setCategories(mockCategories); // Fallback to mock data
        }

        if (expertsData.success) {
          setExperts(expertsData.data);
        } else {
          setExperts(mockExperts); // Fallback to mock data
        }
      } catch (err) {
        console.log('API Error, using mock data:', err);
        // Fallback to mock data
        setNews(mockNews);
        setCategories(mockCategories);
        setExperts(mockExperts);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Filter news based on category and search
  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort news
  const sortedNews = [...filteredNews].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
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
                <div key={i} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
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
      {/* Modern Hero Section */}
      <div className='relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='absolute inset-0'>
          <div className='absolute top-0 left-0 w-full h-full'>
            <div className='absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl'></div>
            <div className='absolute top-32 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg'></div>
            <div className='absolute bottom-20 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl'></div>
              </div>
            </div>

        <div className='relative px-3 sm:px-4 lg:px-6 py-8'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20'>
                    <i className='ri-newspaper-line text-white text-2xl'></i>
                    </div>
                    <div>
                    <h1 className='text-2xl sm:text-3xl font-bold text-white mb-1'>
                      Haberler 📰
                    </h1>
                    <p className='text-blue-100 text-sm sm:text-base'>
                      {sortedNews.length} haber • En güncel gelişmeler
                      </p>
                    </div>
                  </div>
                <p className='text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed'>
                  E-ihracat ve e-ticaret dünyasından en güncel haberler, trendler ve uzman görüşleri
                </p>
                    </div>
              <div className='hidden lg:flex flex-shrink-0'>
                <div className='w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20'>
                  <i className='ri-global-line text-white text-3xl'></i>
                  </div>
              </div>
            </div>
        </div>
      </div>
    </div>

      <div className='px-3 sm:px-4 lg:px-6 py-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Modern Filters */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200'>
                  <i className='ri-filter-line text-white text-lg'></i>
                      </div>
                  <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Filtreler
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {sortedNews.length} haber bulundu
                    </p>
                  </div>
                </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSortBy('latest');
                }}
                className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200'
              >
                <i className='ri-refresh-line text-sm'></i>
                Sıfırla
              </button>
              </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {/* Search */}
                  <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <i className='ri-search-line mr-2'></i>Arama
                    </label>
                <div className='relative'>
                    <input
                    type='text'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder='Haber başlığı veya içerik ara...'
                    className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white'
                  />
                  <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
                </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <i className='ri-folder-line mr-2'></i>Kategori
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer'
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
                  <i className='ri-sort-desc mr-2'></i>Sıralama
                    </label>
                    <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'latest' | 'popular' | 'trending')}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer'
                >
                  <option value='latest'>En Yeni</option>
                  <option value='popular'>En Popüler</option>
                  <option value='trending'>Trend</option>
                    </select>
                  </div>
                  </div>
                </div>

          {/* Modern News Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {sortedNews.map(item => (
              <div
                key={item.id}
                className='group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-105 hover:border-blue-200 transition-all duration-300'
              >
                {/* Image */}
                {item.image_url ? (
                  <div className='aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden'>
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      width={400}
                      height={225}
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                    {item.is_featured && (
                      <div className='absolute top-4 right-4'>
                        <span className='px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold shadow-lg'>
                          ⭐ Öne Çıkan
                    </span>
                </div>
                    )}
              </div>
                ) : (
                  <div className='aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center'>
                    <i className='ri-newspaper-line text-blue-400 text-4xl'></i>
                  </div>
                )}

                {/* Content */}
                <div className='p-6'>
                  {/* Category & Meta */}
                  <div className='flex items-center justify-between mb-4'>
                      <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        categories.find(c => c.name === item.category)?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.category}
                      </span>
                    <div className='flex items-center gap-3 text-xs text-gray-500'>
                      <span className='flex items-center gap-1'>
                        <i className='ri-eye-line'></i>
                        {item.view_count}
                        </span>
                      <span className='flex items-center gap-1'>
                        <i className='ri-time-line'></i>
                        {item.reading_time}d
                      </span>
                    </div>
                    </div>

                    {/* Title */}
                  <h3 className='text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                    {item.title}
                    </h3>

                    {/* Excerpt */}
                  <p className='text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed'>
                    {item.excerpt}
                  </p>

                  {/* Expert */}
                  {item.news_experts && (
                    <div className='flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100'>
                      <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200'>
                        <i className='ri-user-line text-white text-sm'></i>
                        </div>
                        <div>
                        <div className='text-sm font-semibold text-gray-900'>
                          {item.news_experts.name}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {item.news_experts.title}
                        </div>
                        </div>
                      </div>
                    )}

                  {/* Date & Difficulty */}
                  <div className='flex items-center justify-between mb-4'>
                    <span className='text-xs text-gray-500 flex items-center gap-1'>
                      <i className='ri-calendar-line'></i>
                      {formatDate(item.published_at)}
                    </span>
                          <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        item.difficulty_level === 'Başlangıç'
                          ? 'bg-green-100 text-green-700'
                          : item.difficulty_level === 'Orta'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.difficulty_level}
                          </span>
                      </div>

                  {/* Actions */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          likedNews.has(item.id)
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        }`}
                      >
                        <i className={`ri-heart-${likedNews.has(item.id) ? 'fill' : 'line'} text-base`}></i>
                        {item.like_count + (likedNews.has(item.id) ? 1 : 0)}
                      </button>
                      <button
                        onClick={() => setShowComments(showComments === item.id ? null : item.id)}
                        className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200'
                      >
                        <i className='ri-chat-3-line text-base'></i>
                        {item.comment_count + (comments[item.id]?.length || 0)}
                      </button>
                      </div>
                    <button
                      onClick={() => handleBookmark(item.id)}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        bookmarkedNews.has(item.id)
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      }`}
                    >
                      <i className={`ri-bookmark-${bookmarkedNews.has(item.id) ? 'fill' : 'line'} text-base`}></i>
                    </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

          {/* Modern No Results */}
          {sortedNews.length === 0 && (
            <div className='text-center py-16'>
              <div className='w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
                <i className='ri-newspaper-line text-gray-400 text-3xl'></i>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Haber Bulunamadı
              </h3>
              <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                Arama kriterlerinize uygun haber bulunamadı. Filtreleri değiştirmeyi deneyin.
              </p>
                    <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSortBy('latest');
                }}
                className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                <i className='ri-refresh-line text-base'></i>
                Filtreleri Sıfırla
                    </button>
                </div>
              )}
            </div>
        </div>
    </FirmaLayout>
  );
}
