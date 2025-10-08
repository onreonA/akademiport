'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';
interface EducationSet {
  id: string;
  name: string;
  description: string;
  category: string;
  video_count: number;
  total_duration: number;
  progress_percentage: number;
  isLocked?: boolean;
}
interface Document {
  id: string;
  title: string;
  file_type: string;
  progress_percentage: number;
  is_completed: boolean;
}
interface Video {
  id: string;
  title: string;
  duration: number;
  is_completed: boolean;
}
interface ProgressStats {
  totalSets: number;
  completedSets: number;
  totalVideos: number;
  completedVideos: number;
  totalDocuments: number;
  completedDocuments: number;
  overallProgress: number;
}
export default function ProgressDashboardClient() {
  const { user } = useAuthStore();
  const [educationSets, setEducationSets] = useState<EducationSet[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalSets: 0,
    completedSets: 0,
    totalVideos: 0,
    completedVideos: 0,
    totalDocuments: 0,
    completedDocuments: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const calculateStats = useCallback(() => {
    const totalSets = educationSets.length;
    const completedSets = educationSets.filter(
      set => set.progress_percentage >= 100
    ).length;
    const totalVideos = videos.length;
    const completedVideos = videos.filter(video => video.is_completed).length;
    const totalDocuments = documents.length;
    const completedDocuments = documents.filter(doc => doc.is_completed).length;
    const overallProgress =
      totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    setStats({
      totalSets,
      completedSets,
      totalVideos,
      completedVideos,
      totalDocuments,
      completedDocuments,
      overallProgress,
    });
  }, [educationSets, videos, documents]);

  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      const userEmail = user?.email || '';
      if (!userEmail) {
        setError('Kullanıcı bilgisi bulunamadı');
        return;
      }

      // Mock data for now since APIs are not ready
      setEducationSets([]);
      setDocuments([]);
      setVideos([]);
    } catch (err) {
      setError('İlerleme verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user, fetchProgressData]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const filteredSets =
    selectedCategory === 'all'
      ? educationSets
      : educationSets.filter(set => set.category === selectedCategory);
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'B2B':
        return 'bg-blue-100 text-blue-800';
      case 'B2C':
        return 'bg-green-100 text-green-800';
      case 'Destek':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    if (progress >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  if (loading) {
    return (
      <FirmaLayout
        title='İlerleme Takibi'
        description='Eğitim setlerinizin ve dökümanlarınızın ilerleme durumunu takip edin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-gray-600'>İlerleme verileri yükleniyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (error) {
    return (
      <FirmaLayout
        title='İlerleme Takibi'
        description='Eğitim setlerinizin ve dökümanlarınızın ilerleme durumunu takip edin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-error-warning-line text-red-600 text-2xl'></i>
            </div>
            <h3 className='text-lg font-medium text-red-900 mb-2'>
              Hata Oluştu
            </h3>
            <p className='text-red-700 mb-6'>{error}</p>
            <button
              onClick={fetchProgressData}
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
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
      title='İlerleme Takibi'
      description='Eğitim setlerinizin ve dökümanlarınızın ilerleme durumunu takip edin'
    >
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Overall Progress Card */}
          <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-2xl font-bold mb-2'>Genel İlerleme</h2>
                <p className='text-blue-100'>
                  Tüm eğitim setlerinizin genel durumu
                </p>
              </div>
              <div className='text-right'>
                <div className='text-4xl font-bold'>
                  {stats.overallProgress}%
                </div>
                <div className='text-blue-100 text-sm'>
                  {stats.completedSets} / {stats.totalSets} Set Tamamlandı
                </div>
              </div>
            </div>
            <div className='w-full bg-blue-500 bg-opacity-30 rounded-full h-3'>
              <div
                className='bg-white h-3 rounded-full transition-all duration-500'
                style={{ width: `${stats.overallProgress}%` }}
              ></div>
            </div>
          </div>
          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-play-circle-line text-blue-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.completedVideos}
                  </p>
                  <p className='text-sm text-gray-600'>Tamamlanan Video</p>
                  <p className='text-xs text-gray-500'>
                    {stats.totalVideos} toplam
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-file-text-line text-green-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.completedDocuments}
                  </p>
                  <p className='text-sm text-gray-600'>Tamamlanan Döküman</p>
                  <p className='text-xs text-gray-500'>
                    {stats.totalDocuments} toplam
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-folder-line text-purple-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.completedSets}
                  </p>
                  <p className='text-sm text-gray-600'>Tamamlanan Set</p>
                  <p className='text-xs text-gray-500'>
                    {stats.totalSets} toplam
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Category Filter */}
          <div className='mb-6'>
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-gray-700'>
                Kategori Filtresi:
              </span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>Tüm Kategoriler</option>
                <option value='B2B'>B2B</option>
                <option value='B2C'>B2C</option>
                <option value='Destek'>Destek</option>
              </select>
            </div>
          </div>
          {/* Education Sets Progress */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Eğitim Setleri İlerlemesi
            </h3>
            {filteredSets.length === 0 ? (
              <div className='text-center py-12'>
                <i className='ri-folder-line text-gray-400 text-4xl mb-4'></i>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Eğitim seti bulunamadı
                </h3>
                <p className='text-gray-500'>
                  Seçili kategoride eğitim seti bulunmuyor.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredSets.map(set => (
                  <div
                    key={set.id}
                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(set.category)}`}
                        >
                          <i className='ri-folder-line text-lg'></i>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            {set.name}
                          </h4>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(set.category)}`}
                            >
                              {set.category}
                            </span>
                            <span>{set.video_count} video</span>
                            <span>•</span>
                            <span>
                              {Math.round(set.total_duration / 60)} dk
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div
                          className={`text-lg font-bold ${getProgressColor(set.progress_percentage)}`}
                        >
                          {set.progress_percentage}%
                        </div>
                        <div className='text-sm text-gray-500'>
                          {set.progress_percentage >= 100
                            ? 'Tamamlandı'
                            : 'Devam Ediyor'}
                        </div>
                      </div>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2 mb-3'>
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          set.progress_percentage >= 80
                            ? 'bg-green-500'
                            : set.progress_percentage >= 60
                              ? 'bg-yellow-500'
                              : set.progress_percentage >= 40
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${set.progress_percentage}%` }}
                      ></div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <p className='text-sm text-gray-600 line-clamp-2'>
                        {set.description}
                      </p>
                      <Link
                        href={`/firma/egitimlerim/videolar/${set.id}`}
                        className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                      >
                        Devam Et
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Recent Activity */}
          <div className='mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Son Aktiviteler
            </h3>
            <div className='space-y-4'>
              {documents.slice(0, 5).map(doc => (
                <div
                  key={doc.id}
                  className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
                >
                  <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100'>
                    <i className='ri-file-text-line text-blue-600 text-sm'></i>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      {doc.title}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {doc.is_completed
                        ? 'Tamamlandı'
                        : `${doc.progress_percentage}% tamamlandı`}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      doc.is_completed ? 'text-green-600' : 'text-blue-600'
                    }`}
                  >
                    {doc.is_completed ? '✓' : '○'}
                  </div>
                </div>
              ))}
              {videos.slice(0, 5).map(video => (
                <div
                  key={video.id}
                  className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
                >
                  <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-green-100'>
                    <i className='ri-play-circle-line text-green-600 text-sm'></i>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      {video.title}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {video.is_completed ? 'İzlenmiş' : 'İzlenmemiş'}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      video.is_completed ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {video.is_completed ? '✓' : '○'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
