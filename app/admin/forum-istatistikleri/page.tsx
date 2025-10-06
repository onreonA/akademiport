'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
interface ForumStats {
  overview: {
    totalTopics: number;
    totalReplies: number;
    totalUsers: number;
    totalCategories: number;
    period: number;
  };
  recentActivity: {
    topics: any[];
    replies: any[];
  };
  popularTopics: any[];
  topUsers: any[];
  categoryStats: any[];
  dailyActivity: { [key: string]: number };
}
const fetchStatistics = async (period: string): Promise<ForumStats | null> => {
  try {
    const response = await fetch(`/api/forum/statistics?period=${period}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};
const ForumStatisticsPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await fetchStatistics(period);
        setStats(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    // Clock update
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(clock);
    };
  }, [period]);
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
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4'></div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            İstatistikler Yükleniyor
          </h3>
          <p className='text-gray-600'>Forum verileri analiz ediliyor...</p>
        </div>
      </div>
    );
  }
  if (!stats) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-2xl'></i>
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            İstatistikler Yüklenemedi
          </h3>
          <p className='text-gray-600 mb-4'>Forum verileri getirilemedi.</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            {/* Left */}
            <div className='flex items-center gap-6'>
              <Link href='/admin' className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-admin-line text-white text-lg w-5 h-5 flex items-center justify-center'></i>
                </div>
                <div className='flex flex-col'>
                  <span className="font-['Pacifico'] text-xl text-red-900 leading-tight">
                    İhracat Akademi
                  </span>
                  <span className='text-xs text-gray-500 font-medium'>
                    Admin Paneli
                  </span>
                </div>
              </Link>
              {/* Breadcrumb */}
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-red-600 cursor-pointer'
                >
                  Admin Paneli
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>
                  Forum İstatistikleri
                </span>
              </nav>
            </div>
            {/* Right */}
            <div className='flex items-center gap-3'>
              {/* Period Selector */}
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500'
              >
                <option value='7'>Son 7 Gün</option>
                <option value='30'>Son 30 Gün</option>
                <option value='90'>Son 90 Gün</option>
              </select>
              {/* Live Time */}
              <div className='hidden lg:flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg'>
                <i className='ri-time-line text-gray-400 text-sm'></i>
                <span
                  className='text-sm text-gray-600 font-mono'
                  suppressHydrationWarning={true}
                >
                  {currentTime.toLocaleTimeString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main content */}
      <div className='pt-20'>
        <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'>
          {/* Page Header */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  Forum İstatistikleri
                </h1>
                <p className='text-gray-600'>
                  Son {stats.overview.period} günlük forum aktivitelerini analiz
                  edin.
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <Link href='/admin/forum-yonetimi'>
                  <button className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'>
                    <i className='ri-settings-line'></i>
                    Forum Yönetimi
                  </button>
                </Link>
              </div>
            </div>
          </div>
          {/* Overview Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Total Topics */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Toplam Konu
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {formatNumber(stats.overview.totalTopics)}
                  </p>
                </div>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-chat-3-line text-blue-600 text-xl'></i>
                </div>
              </div>
            </div>
            {/* Total Replies */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Toplam Yanıt
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {formatNumber(stats.overview.totalReplies)}
                  </p>
                </div>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-message-3-line text-green-600 text-xl'></i>
                </div>
              </div>
            </div>
            {/* Total Users */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Aktif Kullanıcı
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {formatNumber(stats.overview.totalUsers)}
                  </p>
                </div>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-user-line text-purple-600 text-xl'></i>
                </div>
              </div>
            </div>
            {/* Total Categories */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Kategori</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {formatNumber(stats.overview.totalCategories)}
                  </p>
                </div>
                <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-folder-line text-orange-600 text-xl'></i>
                </div>
              </div>
            </div>
          </div>
          {/* Charts and Lists */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Popular Topics */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='p-6 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Popüler Konular
                </h3>
                <p className='text-sm text-gray-600'>
                  En çok görüntülenen konular
                </p>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {stats.popularTopics.map((topic, index) => (
                    <div key={topic.id} className='flex items-center gap-4'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-600'>
                          {index + 1}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-medium text-gray-900 truncate'>
                          {topic.title}
                        </h4>
                        <div className='flex items-center gap-4 text-xs text-gray-500 mt-1'>
                          <span className='flex items-center gap-1'>
                            <i className='ri-eye-line'></i>
                            {formatNumber(topic.view_count)}
                          </span>
                          <span className='flex items-center gap-1'>
                            <i className='ri-message-3-line'></i>
                            {topic.reply_count}
                          </span>
                          <span className='flex items-center gap-1'>
                            <i className='ri-heart-line'></i>
                            {topic.like_count}
                          </span>
                        </div>
                      </div>
                      {topic.forum_categories && (
                        <span
                          className={`inline-flex items-center px-2 py-1 ${topic.forum_categories.color} text-white text-xs font-medium rounded-full`}
                        >
                          {topic.forum_categories.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Top Users */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='p-6 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  En Aktif Kullanıcılar
                </h3>
                <p className='text-sm text-gray-600'>
                  Son {stats.overview.period} günlük aktivite
                </p>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {stats.topUsers.map((user, index) => (
                    <div key={user.id} className='flex items-center gap-4'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-600'>
                          {index + 1}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-medium text-gray-900'>
                          {user.name}
                        </h4>
                        <p className='text-xs text-gray-500'>{user.email}</p>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.topics + user.replies}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {user.topics} konu, {user.replies} yanıt
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Category Stats */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='p-6 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Kategori İstatistikleri
                </h3>
                <p className='text-sm text-gray-600'>
                  Konu sayısına göre kategoriler
                </p>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {stats.categoryStats.map((category, index) => (
                    <div key={category.id} className='flex items-center gap-4'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-600'>
                          {index + 1}
                        </span>
                      </div>
                      <div className='flex items-center gap-3 flex-1'>
                        <div
                          className={`w-6 h-6 ${category.color} rounded-lg flex items-center justify-center`}
                        >
                          <i className='ri-folder-line text-white text-xs'></i>
                        </div>
                        <span className='text-sm font-medium text-gray-900'>
                          {category.name}
                        </span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-medium text-gray-900'>
                          {category.topic_count}
                        </div>
                        <div className='text-xs text-gray-500'>konu</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Recent Activity */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='p-6 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Son Aktiviteler
                </h3>
                <p className='text-sm text-gray-600'>
                  Son {stats.overview.period} günlük aktiviteler
                </p>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {stats.recentActivity.topics.slice(0, 5).map(topic => (
                    <div key={topic.id} className='flex items-start gap-3'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-medium text-gray-900 truncate'>
                          {topic.title}
                        </h4>
                        <p className='text-xs text-gray-500'>
                          {getTimeAgo(topic.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {stats.recentActivity.replies.slice(0, 3).map(reply => (
                    <div key={reply.id} className='flex items-start gap-3'>
                      <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-medium text-gray-900 truncate'>
                          {reply.content.substring(0, 50)}...
                        </h4>
                        <p className='text-xs text-gray-500'>
                          {getTimeAgo(reply.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForumStatisticsPage;
