'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';

interface DashboardStats {
  totalSets: number;
  completedSets: number;
  inProgressSets: number;
  totalVideos: number;
  completedVideos: number;
  totalDocuments: number;
  completedDocuments: number;
  overallProgress: number;
}

export default function FirmaEgitimlerimPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalSets: 0,
    completedSets: 0,
    inProgressSets: 0,
    totalVideos: 0,
    completedVideos: 0,
    totalDocuments: 0,
    completedDocuments: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const userEmail = user?.email || '';

      if (!userEmail) {
        setLoading(false);
        return;
      }

      // Fetch education assignments
      const setsResponse = await fetch('/api/company/education-assignments', {
        headers: { 'X-User-Email': userEmail },
      });

      // Fetch video progress
      const videosResponse = await fetch('/api/video-watch-progress', {
        headers: { 'X-User-Email': userEmail },
      });

      // Fetch documents
      const docsResponse = await fetch('/api/documents', {
        headers: { 'X-User-Email': userEmail },
      });

      if (setsResponse.ok) {
        const setsResult = await setsResponse.json();
        if (setsResult.success) {
          const sets = setsResult.data || [];
          const completed = sets.filter(
            (s: any) => s.completionPercentage >= 100
          ).length;
          const inProgress = sets.filter(
            (s: any) =>
              s.completionPercentage > 0 && s.completionPercentage < 100
          ).length;

          setStats(prev => ({
            ...prev,
            totalSets: sets.length,
            completedSets: completed,
            inProgressSets: inProgress,
            overallProgress:
              sets.length > 0
                ? Math.round(
                    sets.reduce(
                      (sum: number, s: any) =>
                        sum + (s.completionPercentage || 0),
                      0
                    ) / sets.length
                  )
                : 0,
          }));
        }
      }

      if (videosResponse.ok) {
        const videosResult = await videosResponse.json();
        if (videosResult.success) {
          const videos = videosResult.data || [];
          const completed = videos.filter((v: any) => v.is_completed).length;

          setStats(prev => ({
            ...prev,
            totalVideos: videos.length,
            completedVideos: completed,
          }));
        }
      }

      if (docsResponse.ok) {
        const docsResult = await docsResponse.json();
        if (docsResult.success) {
          const docs = docsResult.data || [];
          const completed = docs.filter((d: any) => d.is_completed).length;

          setStats(prev => ({
            ...prev,
            totalDocuments: docs.length,
            completedDocuments: completed,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user, fetchDashboardStats]);

  const CircularProgress = ({
    progress,
    size = 80,
  }: {
    progress: number;
    size?: number;
  }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className='relative' style={{ width: size, height: size }}>
        <svg className='transform -rotate-90' width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke='currentColor'
            strokeWidth='6'
            className='text-gray-200'
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke='currentColor'
            strokeWidth='6'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap='round'
            className='text-blue-500 transition-all duration-1000 ease-out'
          />
        </svg>
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-lg font-bold text-gray-900'>{progress}%</span>
        </div>
      </div>
    );
  };

  return (
    <FirmaLayout
      title='Eğitimlerim'
      description='Eğitim içeriklerinize erişin ve ilerlemenizi takip edin'
    >
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'>
        {/* Hero Section - Compact */}
        <div className='relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white'>
          <div className='absolute inset-0 bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEzIDAgNiAyLjY4NyA2IDZzLTIuNjg3IDYtNiA2LTYtMi42ODctNi02IDIuNjg3LTYgNi02ek0yMCAzNGMzLjMxMyAwIDYgMi42ODcgNiA2cy0yLjY4NyA2LTYgNi02LTIuNjg3LTYtNiAyLjY4Ny02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==")] opacity-10'></div>
          <div className='relative px-3 sm:px-4 lg:px-6 py-6'>
            <div className='max-w-7xl mx-auto'>
              <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
                <div className='flex-1 text-center md:text-left'>
                  <h1 className='text-2xl md:text-3xl font-bold mb-2 animate-fade-in'>
                    Hoş Geldiniz! 👋
                  </h1>
                  <p className='text-base md:text-lg text-blue-100 mb-4'>
                    Öğrenme yolculuğunuza devam edin ve hedeflerinize ulaşın
                  </p>
                  <div className='flex flex-wrap gap-3 justify-center md:justify-start'>
                    <Link
                      href='/firma/egitimlerim/videolar'
                      className='inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-lg text-sm'
                    >
                      <i className='ri-play-circle-line text-lg'></i>
                      Eğitimlere Başla
                    </Link>
                    <Link
                      href='/firma/egitimlerim/ilerleme'
                      className='inline-flex items-center gap-2 bg-blue-500/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500/30 transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm'
                    >
                      <i className='ri-line-chart-line text-lg'></i>
                      İlerlememi Gör
                    </Link>
                  </div>
                </div>
                <div className='flex-shrink-0'>
                  {loading ? (
                    <div className='w-20 h-20 rounded-full bg-white/10 animate-pulse'></div>
                  ) : (
                    <div className='relative'>
                      <CircularProgress
                        progress={stats.overallProgress}
                        size={100}
                      />
                      <div className='absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg'>
                        <i className='ri-trophy-line text-yellow-500 text-lg'></i>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='px-3 sm:px-4 lg:px-6 py-6'>
          <div className='max-w-7xl mx-auto space-y-6'>
            {/* Quick Stats */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {loading ? (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse'
                    >
                      <div className='h-12 w-12 bg-gray-200 rounded-xl mb-4'></div>
                      <div className='h-8 w-16 bg-gray-200 rounded mb-2'></div>
                      <div className='h-4 w-24 bg-gray-200 rounded'></div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className='group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:scale-105 hover:border-blue-200 transition-all duration-300'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200'>
                        <i className='ri-play-circle-line text-white text-2xl'></i>
                      </div>
                      <span className='text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full'>
                        +{stats.inProgressSets} aktif
                      </span>
                    </div>
                    <p className='text-3xl font-bold text-gray-900 mb-1'>
                      {stats.totalSets}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>
                      Video Eğitim Seti
                    </p>
                    <div className='mt-4 flex items-center gap-2 text-xs text-gray-500'>
                      <i className='ri-checkbox-circle-line text-green-500'></i>
                      {stats.completedSets} tamamlandı
                    </div>
                  </div>

                  <div className='group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:scale-105 hover:border-green-200 transition-all duration-300'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200'>
                        <i className='ri-video-line text-white text-2xl'></i>
                      </div>
                      {stats.totalVideos > 0 && (
                        <span className='text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full'>
                          {Math.round(
                            (stats.completedVideos / stats.totalVideos) * 100
                          )}
                          %
                        </span>
                      )}
                    </div>
                    <p className='text-3xl font-bold text-gray-900 mb-1'>
                      {stats.completedVideos}/{stats.totalVideos}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>
                      İzlenen Video
                    </p>
                    <div className='mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out'
                        style={{
                          width:
                            stats.totalVideos > 0
                              ? `${(stats.completedVideos / stats.totalVideos) * 100}%`
                              : '0%',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className='group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:scale-105 hover:border-purple-200 transition-all duration-300'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200'>
                        <i className='ri-file-text-line text-white text-2xl'></i>
                      </div>
                      {stats.totalDocuments > 0 && (
                        <span className='text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full'>
                          {Math.round(
                            (stats.completedDocuments / stats.totalDocuments) *
                              100
                          )}
                          %
                        </span>
                      )}
                    </div>
                    <p className='text-3xl font-bold text-gray-900 mb-1'>
                      {stats.completedDocuments}/{stats.totalDocuments}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>
                      Okunan Döküman
                    </p>
                    <div className='mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000 ease-out'
                        style={{
                          width:
                            stats.totalDocuments > 0
                              ? `${(stats.completedDocuments / stats.totalDocuments) * 100}%`
                              : '0%',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className='group bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-sm p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 text-white'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg'>
                        <i className='ri-fire-line text-white text-2xl'></i>
                      </div>
                      <span className='text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full'>
                        Günlük Hedef
                      </span>
                    </div>
                    <p className='text-3xl font-bold mb-1'>
                      {stats.overallProgress}%
                    </p>
                    <p className='text-sm font-medium text-white/90'>
                      Genel İlerleme
                    </p>
                    <div className='mt-4 flex items-center gap-2 text-xs text-white/80'>
                      <i className='ri-trending-up-line'></i>
                      Harika gidiyorsun!
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Education Categories */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Link href='/firma/egitimlerim/videolar' className='group'>
                <div className='relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden'>
                  <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500'></div>
                  <div className='relative'>
                    <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-play-circle-line text-white text-2xl'></i>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                      Video Eğitimleri
                    </h3>
                    <p className='text-gray-600 mb-3 leading-relaxed text-sm'>
                      YouTube videoları ile interaktif eğitim deneyimi yaşayın
                      ve uzmanlardan öğrenin
                    </p>
                    <div className='flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all'>
                      <span>Keşfet</span>
                      <i className='ri-arrow-right-line'></i>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href='/firma/egitimlerim/dokumanlar' className='group'>
                <div className='relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-green-200 transition-all duration-300 overflow-hidden'>
                  <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500'></div>
                  <div className='relative'>
                    <div className='w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-file-text-line text-white text-2xl'></i>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors'>
                      Dökümanlar
                    </h3>
                    <p className='text-gray-600 mb-3 leading-relaxed text-sm'>
                      PDF, Word ve PowerPoint dökümanları ile detaylı bilgi
                      edinin ve referans olarak kullanın
                    </p>
                    <div className='flex items-center gap-2 text-green-600 font-semibold group-hover:gap-4 transition-all'>
                      <span>İncele</span>
                      <i className='ri-arrow-right-line'></i>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href='/firma/egitimlerim/ilerleme' className='group'>
                <div className='relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden'>
                  <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500'></div>
                  <div className='relative'>
                    <div className='w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-bar-chart-box-line text-white text-2xl'></i>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors'>
                      İlerleme Takibi
                    </h3>
                    <p className='text-gray-600 mb-3 leading-relaxed text-sm'>
                      Eğitim setlerinizin ve dökümanlarınızın ilerleme durumunu
                      detaylı olarak takip edin
                    </p>
                    <div className='flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all'>
                      <span>Analiz Et</span>
                      <i className='ri-arrow-right-line'></i>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
