'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
interface Video {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  duration: number;
  order_index: number;
  status: string;
  set_id: string;
}
interface VideoProgress {
  id: string;
  video_id: string;
  watched_duration: number;
  is_completed: boolean;
  watched_at: string;
}
interface EducationSet {
  id: string;
  name: string;
  description: string;
  category: string;
}
interface VideoList {
  id: string;
  title: string;
  order_index: number;
  is_completed: boolean;
  is_current: boolean;
}
export default function VideoPlayerClient({
  setId,
  videoId,
}: {
  setId: string;
  videoId: string;
}) {
  const [video, setVideo] = useState<Video | null>(null);
  const [educationSet, setEducationSet] = useState<EducationSet | null>(null);
  const [videoList, setVideoList] = useState<VideoList[]>([]);
  const [currentProgress, setCurrentProgress] = useState<VideoProgress | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showAutoAdvanceNotification, setShowAutoAdvanceNotification] =
    useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  // Fetch video details
  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 VideoPlayerClient - fetchVideoDetails:', { setId, videoId });
      const response = await fetch(`/api/videos/${videoId}`, {
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      if (!response.ok) {
        throw new Error('Video detayları getirilemedi');
      }
      const result = await response.json();
      if (result.success) {
        setVideo(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Video yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  // Fetch education set details
  const fetchEducationSet = async () => {
    try {
      const response = await fetch(`/api/education-sets/${setId}`, {
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEducationSet(result.data);
        }
      }
    } catch (error) {}
  };
  // Fetch video list for this set
  const fetchVideoList = async () => {
    try {
      const response = await fetch(`/api/videos?set_id=${setId}`, {
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Get progress for all videos
          const progressResponse = await fetch('/api/video-watch-progress', {
            headers: {
              'X-User-Email': 'info@mundo.com',
            },
          });
          let progressData: VideoProgress[] = [];
          if (progressResponse.ok) {
            const progressResult = await progressResponse.json();
            if (progressResult.success) {
              progressData = progressResult.data;
            }
          }
          // Combine video list with progress
          const videosWithProgress = result.data.map((v: Video) => {
            const progress = progressData.find(p => p.video_id === v.id);
            return {
              id: v.id,
              title: v.title,
              order_index: v.order_index,
              is_completed: progress?.is_completed || false,
              is_current: v.id === videoId,
            };
          });
          setVideoList(
            videosWithProgress.sort(
              (a: VideoList, b: VideoList) => a.order_index - b.order_index
            )
          );
        }
      }
    } catch (error) {}
  };
  // Fetch current video progress
  const fetchVideoProgress = async () => {
    try {
      const response = await fetch(
        `/api/video-watch-progress?video_id=${videoId}`,
        {
          headers: {
            'X-User-Email': 'info@mundo.com',
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          setCurrentProgress(result.data[0]);
        }
      }
    } catch (error) {}
  };
  // Save video progress
  const saveVideoProgress = async (
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
          // Refresh video list to update completion status
          fetchVideoList();
          // Auto-advance to next video if completed
          if (isCompleted) {
            const currentIndex = videoList.findIndex(v => v.id === videoId);
            if (currentIndex < videoList.length - 1) {
              const nextVideo = videoList[currentIndex + 1];
              if (isVideoAccessible(nextVideo)) {
                setShowAutoAdvanceNotification(true);
                setTimeout(() => {
                  window.location.href = `/firma/egitimlerim/videolar/${setId}/video/${nextVideo.id}`;
                }, 3000); // 3 second delay
              }
            }
          }
        }
      }
    } catch (error) {}
  };
  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  // Check if video is accessible (sequential watching)
  const isVideoAccessible = (videoItem: VideoList) => {
    const currentIndex = videoList.findIndex(v => v.id === videoItem.id);
    if (currentIndex === 0) return true; // First video is always accessible
    // Check if all previous videos are completed
    for (let i = 0; i < currentIndex; i++) {
      if (!videoList[i].is_completed) {
        return false;
      }
    }
    return true;
  };
  // Load data on component mount
  useEffect(() => {
    fetchVideoDetails();
    fetchEducationSet();
    fetchVideoList();
    fetchVideoProgress();
  }, [videoId, setId]);
  if (loading) {
    return (
      <FirmaLayout
        title='Video Yükleniyor'
        description='Video içeriği yükleniyor...'
      >
        <div className='p-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Video yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (error || !video) {
    return (
      <FirmaLayout
        title='Video Bulunamadı'
        description='Video içeriği yüklenemedi'
      >
        <div className='p-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-error-warning-line text-red-600 text-2xl'></i>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Video bulunamadı
                </h3>
                <p className='text-gray-500 mb-4'>
                  {error || 'Video yüklenemedi'}
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
  const youtubeId = getYouTubeVideoId(video.youtube_url);
  return (
    <FirmaLayout
      title={video?.title || 'Video Oynatıcı'}
      description={educationSet?.name || 'Video eğitimi izleyin'}
    >
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            {/* Video Player Section */}
            <div className='lg:col-span-3'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                {/* Video Player */}
                <div className='aspect-video bg-black'>
                  {video.youtube_url && youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                      title={video.title}
                      className='w-full h-full'
                      allowFullScreen
                      onLoad={() => {
                        // Mark as started watching
                        if (!currentProgress) {
                          saveVideoProgress(0, false);
                        }
                      }}
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <div className='text-center text-white'>
                        <i className='ri-video-line text-4xl mb-2'></i>
                        <p>Video yüklenemedi</p>
                        {!video.youtube_url && (
                          <p className='text-sm text-gray-400 mt-2'>
                            YouTube linki bulunamadı
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Video Info */}
                <div className='p-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                        {video.title}
                      </h1>
                      <div className='flex items-center gap-4 text-sm text-gray-500'>
                        <span>
                          <i className='ri-time-line mr-1'></i>
                          {formatDuration(video.duration)}
                        </span>
                        <span>
                          <i className='ri-sort-asc mr-1'></i>Sıra:{' '}
                          {video.order_index}
                        </span>
                        {currentProgress?.is_completed && (
                          <span className='text-green-600 font-medium'>
                            <i className='ri-check-line mr-1'></i>Tamamlandı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className='text-gray-600 mb-4'>{video.description}</p>
                  {/* Progress Actions */}
                  <div className='flex gap-3'>
                    {!currentProgress?.is_completed ? (
                      <>
                        <button
                          onClick={() =>
                            saveVideoProgress(video.duration, true)
                          }
                          className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                        >
                          <i className='ri-check-line mr-2'></i>
                          Videoyu Tamamladım
                        </button>
                        <button
                          onClick={() =>
                            saveVideoProgress(
                              Math.floor(video.duration * 0.8),
                              false
                            )
                          }
                          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                        >
                          <i className='ri-time-line mr-2'></i>
                          %80 İzledim
                        </button>
                      </>
                    ) : (
                      <div className='flex items-center gap-2 text-green-600'>
                        <i className='ri-check-circle-line text-xl'></i>
                        <span className='font-medium'>Video tamamlandı!</span>
                      </div>
                    )}
                  </div>
                  {/* Navigation Buttons */}
                  <div className='flex justify-between mt-4 pt-4 border-t border-gray-200'>
                    {videoList.findIndex(v => v.id === videoId) > 0 && (
                      <Link
                        href={`/firma/egitimlerim/videolar/${setId}/video/${videoList[videoList.findIndex(v => v.id === videoId) - 1].id}`}
                        className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                      >
                        <i className='ri-arrow-left-line mr-2'></i>
                        Önceki Video
                      </Link>
                    )}
                    {videoList.findIndex(v => v.id === videoId) <
                      videoList.length - 1 && (
                      <Link
                        href={`/firma/egitimlerim/videolar/${setId}/video/${videoList[videoList.findIndex(v => v.id === videoId) + 1].id}`}
                        className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm ml-auto'
                      >
                        Sonraki Video
                        <i className='ri-arrow-right-line ml-2'></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div className='lg:col-span-1'>
              {/* Video List */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Video Listesi
                </h3>
                <div className='space-y-2'>
                  {videoList.map(videoItem => (
                    <Link
                      key={videoItem.id}
                      href={`/firma/egitimlerim/videolar/${setId}/video/${videoItem.id}`}
                      className={`block p-3 rounded-lg transition-colors cursor-pointer ${
                        videoItem.is_current
                          ? 'bg-blue-100 border border-blue-200'
                          : isVideoAccessible(videoItem)
                            ? 'hover:bg-gray-50'
                            : 'bg-gray-100 cursor-not-allowed opacity-60'
                      }`}
                      onClick={e => {
                        if (!isVideoAccessible(videoItem)) {
                          e.preventDefault();
                          alert(
                            'Bu videoyu izlemek için önceki videoları tamamlamanız gerekiyor.'
                          );
                        }
                      }}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              videoItem.is_completed
                                ? 'bg-green-100 text-green-800'
                                : videoItem.is_current
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {videoItem.is_completed ? (
                              <i className='ri-check-line'></i>
                            ) : (
                              videoItem.order_index
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              videoItem.is_current
                                ? 'font-medium text-blue-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {videoItem.title}
                          </span>
                        </div>
                        {videoItem.is_completed && (
                          <i className='ri-check-line text-green-600'></i>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Quick Stats */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  İlerleme
                </h3>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-1'>
                      <span className='text-gray-600'>Genel İlerleme</span>
                      <span className='font-medium'>
                        {Math.round(
                          (videoList.filter(v => v.is_completed).length /
                            videoList.length) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{
                          width: `${(videoList.filter(v => v.is_completed).length / videoList.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className='text-sm text-gray-600'>
                    <div className='flex justify-between'>
                      <span>Tamamlanan:</span>
                      <span className='font-medium text-green-600'>
                        {videoList.filter(v => v.is_completed).length}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Toplam:</span>
                      <span className='font-medium'>{videoList.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Notes Modal */}
      {showNotes && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Video Notları
              </h3>
            </div>
            <div className='p-6'>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder='Bu video hakkında notlarınızı buraya yazabilirsiniz...'
                rows={8}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
              <div className='flex justify-end gap-3 mt-4'>
                <button
                  onClick={() => setShowNotes(false)}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer'
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    // Save notes logic here
                    setShowNotes(false);
                  }}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Chat Modal */}
      {showChat && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Danışman ile Görüş
              </h3>
            </div>
            <div className='p-6'>
              <div className='bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-y-auto'>
                <div className='text-sm text-gray-600'>
                  <p>Bu video hakkında danışmanınıza soru sorabilirsiniz.</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <input
                  type='text'
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder='Mesajınızı yazın...'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                <button
                  onClick={() => {
                    // Send message logic here
                    setChatMessage('');
                  }}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
                >
                  Gönder
                </button>
              </div>
              <div className='flex justify-end mt-4'>
                <button
                  onClick={() => setShowChat(false)}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer'
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Documents Modal */}
      {showDocuments && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Video Dökümanları
              </h3>
            </div>
            <div className='p-6'>
              {documents.length > 0 ? (
                <div className='space-y-3'>
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center gap-3'>
                        <i className='ri-file-text-line text-blue-600 text-xl'></i>
                        <div>
                          <div className='font-medium text-gray-900'>
                            {doc.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {doc.type} • {doc.size}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm'
                      >
                        <i className='ri-download-line mr-1'></i>
                        İndir
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <i className='ri-file-text-line text-gray-400 text-4xl mb-4'></i>
                  <p className='text-gray-500'>
                    Bu video için henüz döküman eklenmemiş.
                  </p>
                </div>
              )}
              <div className='flex justify-end mt-6'>
                <button
                  onClick={() => setShowDocuments(false)}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer'
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Auto-advance Notification */}
      {showAutoAdvanceNotification && (
        <div className='fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'>
          <div className='flex items-center gap-3'>
            <i className='ri-check-line text-xl'></i>
            <div>
              <div className='font-medium'>Video tamamlandı!</div>
              <div className='text-sm opacity-90'>
                3 saniye sonra sonraki videoya geçiliyor...
              </div>
            </div>
          </div>
        </div>
      )}
    </FirmaLayout>
  );
}
