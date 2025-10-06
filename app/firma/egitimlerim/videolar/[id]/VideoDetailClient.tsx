'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
interface Video {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  duration: number;
  order_index: number;
  status: string;
  isCompleted?: boolean;
}
interface EducationSet {
  id: string;
  name: string;
  description: string;
  category: string;
  video_count: number;
  total_duration: number;
  status: string;
  progress_percentage: number;
  videos: Video[];
}
interface VideoDetailClientProps {
  setId: string;
}
export default function VideoDetailClient({ setId }: VideoDetailClientProps) {
  const [educationSet, setEducationSet] = useState<EducationSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'videos' | 'progress'
  >('overview');
  useEffect(() => {
    fetchEducationSetDetails();
  }, [fetchEducationSetDetails]);
  const fetchEducationSetDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch education set details
      const setResponse = await fetch(`/api/education-sets/${setId}`, {
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      if (!setResponse.ok) {
        throw new Error('Eğitim seti detayları getirilemedi');
      }
      const setResult = await setResponse.json();
      if (!setResult.success) {
        throw new Error(setResult.error || 'Eğitim seti bulunamadı');
      }
      // Fetch videos for this set
      const videosResponse = await fetch(`/api/videos?set_id=${setId}`, {
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      if (!videosResponse.ok) {
        throw new Error('Videolar getirilemedi');
      }
      const videosResult = await videosResponse.json();
      if (!videosResult.success) {
        throw new Error(videosResult.error || 'Videolar bulunamadı');
      }
      // Fetch video progress for this company
      const progressResponse = await fetch('/api/video-watch-progress', {
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      let videoProgress: any[] = [];
      if (progressResponse.ok) {
        const progressResult = await progressResponse.json();
        if (progressResult.success) {
          videoProgress = progressResult.data || [];
        }
      }
      // Combine data
      const setData = setResult.data;
      const videosData = videosResult.data;
      // Mark videos as completed based on progress
      const videosWithProgress = videosData.map((video: Video) => {
        const progress = videoProgress.find(
          (p: any) => p.video_id === video.id
        );
        return {
          ...video,
          isCompleted: progress?.is_completed || false,
        };
      });
      // Calculate progress percentage
      const completedVideos = videosWithProgress.filter(
        (v: Video) => v.isCompleted
      ).length;
      const progressPercentage =
        videosWithProgress.length > 0
          ? Math.round((completedVideos / videosWithProgress.length) * 100)
          : 0;
      // Calculate total duration
      const totalDuration = videosWithProgress.reduce(
        (sum: number, video: Video) => sum + video.duration,
        0
      );
      setEducationSet({
        ...setData,
        videos: videosWithProgress,
        progress_percentage: progressPercentage,
        video_count: videosWithProgress.length,
        total_duration: totalDuration,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  }, [setId]);
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Eğitim Seti Yükleniyor'
        description='Eğitim seti detayları yükleniyor...'
      >
        <div className='p-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Eğitim seti yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (error || !educationSet) {
    return (
      <FirmaLayout
        title='Eğitim Seti Bulunamadı'
        description='Eğitim seti yüklenemedi'
      >
        <div className='p-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-error-warning-line text-red-600 text-2xl'></i>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Eğitim seti bulunamadı
                </h3>
                <p className='text-gray-500 mb-4'>
                  {error || 'Eğitim seti yüklenemedi'}
                </p>
                <Link
                  href='/firma/egitimlerim/videolar'
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
                >
                  Eğitim Setlerine Dön
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title={educationSet?.name || 'Eğitim Seti Detayı'}
      description={
        educationSet?.description || 'Eğitim seti detaylarını görüntüleyin'
      }
    >
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Breadcrumb */}
          <nav className='flex mb-6' aria-label='Breadcrumb'>
            <ol className='inline-flex items-center space-x-1 md:space-x-3'>
              <li className='inline-flex items-center'>
                <Link
                  href='/firma/egitimlerim/videolar'
                  className='inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600'
                >
                  <i className='ri-home-7-line mr-2 h-4 w-4'></i>
                  Video Eğitimleri
                </Link>
              </li>
              <li>
                <div className='flex items-center'>
                  <i className='ri-arrow-right-s-line w-6 h-6 text-gray-400'></i>
                  <span className='ml-1 text-sm font-medium text-gray-500 md:ml-2'>
                    {educationSet.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          {/* Tabs */}
          <div className='border-b border-gray-200 mb-6'>
            <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Genel Bakış
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`${
                  activeTab === 'videos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Videolar ({educationSet.videos.length})
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`${
                  activeTab === 'progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                İlerleme
              </button>
            </nav>
          </div>
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                {educationSet.name}
              </h2>
              <p className='text-gray-700 mb-4'>{educationSet.description}</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
                <p>
                  <span className='font-medium'>Kategori:</span>{' '}
                  {educationSet.category}
                </p>
                <p>
                  <span className='font-medium'>Video Sayısı:</span>{' '}
                  {educationSet.video_count}
                </p>
                <p>
                  <span className='font-medium'>Toplam Süre:</span>{' '}
                  {formatDuration(educationSet.total_duration)}
                </p>
                <p>
                  <span className='font-medium'>Durum:</span>{' '}
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      educationSet.status === 'Tamamlandı'
                        ? 'bg-green-100 text-green-800'
                        : educationSet.status === 'Devam Ediyor'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {educationSet.status}
                  </span>
                </p>
              </div>
            </div>
          )}
          {activeTab === 'videos' && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Eğitim Videoları
              </h2>
              <ul className='divide-y divide-gray-200'>
                {educationSet.videos.map(video => (
                  <li key={video.id} className='py-4 flex items-center'>
                    <div className='flex-shrink-0 mr-4'>
                      {video.isCompleted ? (
                        <i className='ri-check-circle-fill text-green-500 text-xl'></i>
                      ) : (
                        <i className='ri-play-circle-line text-blue-500 text-xl'></i>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <Link
                        href={`/firma/egitimlerim/videolar/${setId}/video/${video.id}`}
                        className='text-lg font-medium text-gray-900 hover:text-blue-600'
                      >
                        {video.order_index}. {video.title}
                      </Link>
                      <p className='text-sm text-gray-500'>
                        {formatDuration(video.duration)}
                      </p>
                    </div>
                    <div className='ml-4 flex-shrink-0'>
                      <Link
                        href={`/firma/egitimlerim/videolar/${setId}/video/${video.id}`}
                        className='inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
                      >
                        İzle
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'progress' && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                İlerleme Durumu
              </h2>
              <div className='w-full bg-gray-200 rounded-full h-2.5 mb-4'>
                <div
                  className='bg-blue-600 h-2.5 rounded-full'
                  style={{ width: `${educationSet.progress_percentage}%` }}
                ></div>
              </div>
              <p className='text-sm text-gray-600'>
                Genel İlerleme: {educationSet.progress_percentage}%
              </p>
            </div>
          )}
        </div>
      </div>
    </FirmaLayout>
  );
}
