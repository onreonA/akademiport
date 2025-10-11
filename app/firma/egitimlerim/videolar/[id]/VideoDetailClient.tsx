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

interface VideoProgress {
  id: string;
  video_id: string;
  watched_duration: number;
  is_completed: boolean;
  watched_at: string;
}

interface VideoDetailClientProps {
  setId: string;
  videoId?: string;
}

export default function VideoDetailClient({
  setId,
  videoId,
}: VideoDetailClientProps) {
  const [educationSet, setEducationSet] = useState<EducationSet | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentProgress, setCurrentProgress] = useState<VideoProgress | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showDocuments, setShowDocuments] = useState(false);

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

      // Auto-select first video if videoId provided or no video selected
      if (videoId) {
        const targetVideo = videosWithProgress.find(v => v.id === videoId);
        if (targetVideo) {
          setSelectedVideo(targetVideo);
          // Fetch progress for selected video
          const progress = videoProgress.find(p => p.video_id === videoId);
          if (progress) {
            setCurrentProgress(progress);
          }
        }
      } else if (videosWithProgress.length > 0 && !selectedVideo) {
        setSelectedVideo(videosWithProgress[0]);
        const progress = videoProgress.find(
          p => p.video_id === videosWithProgress[0].id
        );
        if (progress) {
          setCurrentProgress(progress);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  }, [setId, videoId, selectedVideo]);

  useEffect(() => {
    fetchEducationSetDetails();
  }, [fetchEducationSetDetails]);

  // Video selection handler
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setShowNotes(false);
    setShowChat(false);
    setShowDocuments(false);
  };

  // Save video progress
  const saveVideoProgress = async (
    videoId: string,
    watchedDuration: number,
    isCompleted: boolean
  ) => {
    try {
      const response = await fetch('/api/video-watch-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'info@mundo.com',
        },
        body: JSON.stringify({
          video_id: videoId,
          watched_duration: watchedDuration,
          is_completed: isCompleted,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentProgress(result.data);
          // Update education set progress
          await fetchEducationSetDetails();
        }
      }
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';

    // Extract video ID from various YouTube URL formats
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`;
    }

    return url; // Return original if no match
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
      title={educationSet?.name || 'Eğitim Seti'}
      description={
        educationSet?.description || 'Eğitim seti detaylarını görüntüleyin'
      }
    >
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/10'>
        <div className='px-3 sm:px-4 lg:px-6 py-4'>
          <div className='max-w-7xl mx-auto'>
            {/* Breadcrumb */}
            <nav className='flex mb-4' aria-label='Breadcrumb'>
              <ol className='inline-flex items-center space-x-1 md:space-x-3'>
                <li className='inline-flex items-center'>
                  <Link
                    href='/firma/egitimlerim/videolar'
                    className='inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'
                  >
                    <i className='ri-play-circle-line mr-2 h-4 w-4'></i>
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

            {/* Header Section - Compact */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6'>
              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                <div className='flex-1'>
                  <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                    {educationSet.name}
                  </h1>
                  <p className='text-gray-600 text-base leading-relaxed mb-3'>
                    {educationSet.description}
                  </p>
                  <div className='flex flex-wrap gap-3 text-sm text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <i className='ri-folder-line text-blue-500'></i>
                      <span className='font-medium'>Kategori:</span>
                      <span className='bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold'>
                        {educationSet.category}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <i className='ri-video-line text-green-500'></i>
                      <span className='font-medium'>
                        {educationSet.video_count} Video
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <i className='ri-time-line text-purple-500'></i>
                      <span className='font-medium'>
                        {formatDuration(educationSet.total_duration)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex-shrink-0'>
                  <div className='text-center'>
                    <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2 shadow-lg'>
                      <span className='text-lg font-bold text-white'>
                        {educationSet.progress_percentage}%
                      </span>
                    </div>
                    <p className='text-xs font-medium text-gray-600'>
                      Tamamlanma
                    </p>
                    <div className='w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(educationSet.progress_percentage)}`}
                        style={{
                          width: `${educationSet.progress_percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Video List Sidebar */}
              <div className='lg:col-span-1'>
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-6'>
                  <h2 className='text-lg font-bold text-gray-900 mb-4'>
                    <i className='ri-play-list-line mr-2 text-blue-500'></i>
                    Video Listesi
                  </h2>
                  <div className='space-y-3'>
                    {educationSet.videos.map((video, index) => (
                      <button
                        key={video.id}
                        onClick={() => handleVideoSelect(video)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                          selectedVideo?.id === video.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900 hover:shadow-md'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedVideo?.id === video.id
                                ? 'bg-white/20'
                                : video.isCompleted
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {video.isCompleted ? (
                              <i className='ri-check-line text-sm'></i>
                            ) : (
                              <span className='text-sm font-semibold'>
                                {video.order_index}
                              </span>
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3
                              className={`font-semibold text-sm mb-1 ${
                                selectedVideo?.id === video.id
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {video.title}
                            </h3>
                            <p
                              className={`text-xs ${
                                selectedVideo?.id === video.id
                                  ? 'text-white/80'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatDuration(video.duration)}
                            </p>
                          </div>
                          {video.isCompleted && (
                            <i
                              className={`ri-check-circle-fill text-sm ${
                                selectedVideo?.id === video.id
                                  ? 'text-white'
                                  : 'text-green-500'
                              }`}
                            ></i>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Player & Content */}
              <div className='lg:col-span-2'>
                {selectedVideo ? (
                  <div className='space-y-4'>
                    {/* Video Player */}
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                      <div className='aspect-video bg-gray-900 relative'>
                        {selectedVideo.youtube_url ? (
                          <iframe
                            src={getYouTubeEmbedUrl(selectedVideo.youtube_url)}
                            title={selectedVideo.title}
                            className='w-full h-full'
                            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <div className='text-center text-white'>
                              <i className='ri-video-line text-6xl mb-4 opacity-50'></i>
                              <p className='text-lg opacity-75'>
                                Video Bulunamadı
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className='p-4'>
                        <h2 className='text-xl font-bold text-gray-900 mb-2'>
                          {selectedVideo.order_index}. {selectedVideo.title}
                        </h2>
                        <p className='text-gray-600 leading-relaxed mb-3'>
                          {selectedVideo.description}
                        </p>

                        {/* Video Actions */}
                        <div className='flex flex-wrap gap-3'>
                          <button
                            onClick={() => setShowNotes(!showNotes)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                              showNotes
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <i className='ri-note-line'></i>
                            Notlar
                          </button>
                          <button
                            onClick={() => setShowChat(!showChat)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                              showChat
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <i className='ri-chat-3-line'></i>
                            Sohbet
                          </button>
                          <button
                            onClick={() => setShowDocuments(!showDocuments)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                              showDocuments
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <i className='ri-file-text-line'></i>
                            Dökümanlar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notes Panel */}
                    {showNotes && (
                      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
                        <h3 className='text-lg font-bold text-gray-900 mb-3'>
                          <i className='ri-note-line mr-2 text-blue-500'></i>
                          Video Notları
                        </h3>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder='Video ile ilgili notlarınızı buraya yazın...'
                          className='w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        <div className='mt-4 flex justify-end'>
                          <button className='bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors'>
                            Notu Kaydet
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Chat Panel */}
                    {showChat && (
                      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
                        <h3 className='text-lg font-bold text-gray-900 mb-3'>
                          <i className='ri-chat-3-line mr-2 text-green-500'></i>
                          Video Sohbeti
                        </h3>
                        <div className='space-y-4'>
                          <div className='h-40 border border-gray-200 rounded-xl p-4 bg-gray-50 overflow-y-auto'>
                            <p className='text-gray-500 text-sm'>
                              Sohbet henüz aktif değil...
                            </p>
                          </div>
                          <div className='flex gap-3'>
                            <input
                              type='text'
                              value={chatMessage}
                              onChange={e => setChatMessage(e.target.value)}
                              placeholder='Mesajınızı yazın...'
                              className='flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent'
                            />
                            <button className='bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors'>
                              Gönder
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Documents Panel */}
                    {showDocuments && (
                      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
                        <h3 className='text-lg font-bold text-gray-900 mb-3'>
                          <i className='ri-file-text-line mr-2 text-purple-500'></i>
                          İlgili Dökümanlar
                        </h3>
                        <div className='text-center py-8 text-gray-500'>
                          <i className='ri-file-line text-4xl mb-3 opacity-50'></i>
                          <p>Bu video için henüz döküman bulunmuyor.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center'>
                    <i className='ri-play-circle-line text-5xl text-gray-300 mb-3'></i>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      Video Seçin
                    </h3>
                    <p className='text-gray-500 text-sm'>
                      İzlemek istediğiniz videoyu soldaki listeden seçin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
