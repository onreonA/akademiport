'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
interface Video {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  duration: number;
  order_index: number;
  thumbnail_url?: string;
  progress?: number;
  isCompleted?: boolean;
}
interface EducationSet {
  id: string;
  name: string;
  description: string;
  videos: Video[];
  total_duration: number;
  progress: number;
  isCompleted: boolean;
}
export default function EducationSetDetailPage() {
  const params = useParams();
  const [educationSet, setEducationSet] = useState<EducationSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchEducationSet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/firma/education-sets/${params.id}`);
        if (!response.ok) {
          throw new Error('Eğitim seti bulunamadı');
        }
        const data = await response.json();
        setEducationSet(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchEducationSet();
    }
  }, [params.id]);
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  const getProgressPercentage = () => {
    if (!educationSet || educationSet.videos.length === 0) return 0;
    const completedVideos = educationSet.videos.filter(
      video => video.isCompleted
    ).length;
    return Math.round((completedVideos / educationSet.videos.length) * 100);
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Eğitim Seti Detayı'
        description='Eğitim seti içeriğini görüntüleyin'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </FirmaLayout>
    );
  }
  if (error || !educationSet) {
    return (
      <FirmaLayout
        title='Eğitim Seti Detayı'
        description='Eğitim seti içeriğini görüntüleyin'
      >
        <div className='text-center py-12'>
          <div className='text-red-500 text-lg mb-4'>
            {error || 'Eğitim seti bulunamadı'}
          </div>
          <Link
            href='/firma/egitimlerim/videolar'
            className='text-blue-600 hover:text-blue-800 underline'
          >
            Geri Dön
          </Link>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Eğitim Seti Detayı'
      description={`${educationSet.name} - Eğitim seti içeriğini görüntüleyin`}
    >
      {/* Breadcrumb */}
      <nav className='flex mb-6' aria-label='Breadcrumb'>
        <ol className='inline-flex items-center space-x-1 md:space-x-3'>
          <li className='inline-flex items-center'>
            <Link
              href='/firma/egitimlerim'
              className='text-gray-700 hover:text-blue-600'
            >
              Eğitimlerim
            </Link>
          </li>
          <li>
            <div className='flex items-center'>
              <i className='ri-arrow-right-s-line mx-1'></i>
              <Link
                href='/firma/egitimlerim/videolar'
                className='text-gray-700 hover:text-blue-600'
              >
                Video Eğitimleri
              </Link>
            </div>
          </li>
          <li aria-current='page'>
            <div className='flex items-center'>
              <i className='ri-arrow-right-s-line mx-1'></i>
              <span className='text-gray-900 font-medium'>
                {educationSet.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>
      {/* Set Header */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              {educationSet.name}
            </h1>
            <p className='text-gray-600 mb-4'>{educationSet.description}</p>
            <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
              <div className='flex items-center'>
                <i className='ri-video-line mr-2'></i>
                {educationSet.videos.length} Video
              </div>
              <div className='flex items-center'>
                <i className='ri-time-line mr-2'></i>
                {formatDuration(educationSet.total_duration)}
              </div>
              <div className='flex items-center'>
                <i className='ri-check-line mr-2'></i>
                {getProgressPercentage()}% Tamamlandı
              </div>
            </div>
          </div>
          <div className='mt-4 lg:mt-0'>
            <div className='bg-gray-100 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                  İlerleme
                </span>
                <span className='text-sm text-gray-500'>
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Videos List */}
      <div className='space-y-4'>
        {educationSet.videos.map((video, index) => (
          <div
            key={video.id}
            className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow'
          >
            <div className='flex items-start space-x-4'>
              {/* Video Thumbnail */}
              <div className='flex-shrink-0'>
                <div className='w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center'>
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      width={128}
                      height={80}
                      className='w-full h-full object-cover rounded-lg'
                    />
                  ) : (
                    <i className='ri-play-circle-line text-3xl text-gray-400'></i>
                  )}
                </div>
              </div>
              {/* Video Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      {index + 1}. {video.title}
                    </h3>
                    <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
                      {video.description}
                    </p>
                    <div className='flex items-center space-x-4 text-sm text-gray-500'>
                      <span className='flex items-center'>
                        <i className='ri-time-line mr-1'></i>
                        {formatDuration(video.duration)}
                      </span>
                      <span className='flex items-center'>
                        <i className='ri-play-circle-line mr-1'></i>
                        Video {index + 1}
                      </span>
                    </div>
                  </div>
                  {/* Video Actions */}
                  <div className='flex items-center space-x-2 ml-4'>
                    {video.isCompleted ? (
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                        <i className='ri-check-line mr-1'></i>
                        Tamamlandı
                      </span>
                    ) : (
                      <Link
                        href={`/firma/egitimlerim/videolar/${params.id}/video/${video.id}`}
                        className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors'
                      >
                        <i className='ri-play-line mr-2'></i>
                        İzle
                      </Link>
                    )}
                  </div>
                </div>
                {/* Progress Bar */}
                {video.progress && video.progress > 0 && !video.isCompleted && (
                  <div className='mt-3'>
                    <div className='flex items-center justify-between text-xs text-gray-500 mb-1'>
                      <span>İlerleme</span>
                      <span>{video.progress}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-1.5'>
                      <div
                        className='bg-blue-600 h-1.5 rounded-full transition-all duration-300'
                        style={{ width: `${video.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Back Button */}
      <div className='mt-8'>
        <Link
          href='/firma/egitimlerim/videolar'
          className='inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors'
        >
          <i className='ri-arrow-left-line mr-2'></i>
          Geri Dön
        </Link>
      </div>
    </FirmaLayout>
  );
}
