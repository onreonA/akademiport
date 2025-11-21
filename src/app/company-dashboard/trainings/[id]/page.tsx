/**
 * Company Training Detail Page
 * Sprint 9: Training Management
 *
 * Company'nin bir eğitimin detaylarını görüntüleme, video izleme ve döküman okuma sayfası
 */

'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, GraduationCap, Video, FileText, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  TrainingVideoPlayer,
  TrainingDocumentViewer,
  TrainingProgressBar,
} from '@/presentation/components/features/trainings';
import type { Training } from '@/domain/entities/Training';
import type { TrainingVideo } from '@/domain/entities/TrainingVideo';
import type { TrainingDocument } from '@/domain/entities/TrainingDocument';
import { toast } from 'sonner';
import { useAuth } from '@/5-shared/hooks/useAuth';

interface VideoProgress {
  videoId: string;
  progress: number; // 0-100
  watchedAt: Date | null;
  isLocked: boolean;
}

interface DocumentProgress {
  documentId: string;
  progress: number; // 0-100
  readAt: Date | null;
  isLocked: boolean;
}

interface TrainingProgress {
  overallProgress: number; // 0-100
  videos: VideoProgress[];
  documents: DocumentProgress[];
}

export default function CompanyTrainingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [training, setTraining] = React.useState<Training | null>(null);
  const [videos, setVideos] = React.useState<TrainingVideo[]>([]);
  const [documents, setDocuments] = React.useState<TrainingDocument[]>([]);
  const [progress, setProgress] = React.useState<TrainingProgress | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'videos' | 'documents'>('overview');

  const fetchTraining = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/trainings/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eğitim bulunamadı');
      }

      setTraining(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Eğitim yüklenirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }, [id]);

  const fetchVideos = React.useCallback(async () => {
    try {
      console.log('🔍 [CompanyTrainingDetail] Fetching videos for training:', id);
      const response = await fetch(`/api/trainings/${id}/videos`);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Videolar yüklenemedi';
        console.error('❌ [CompanyTrainingDetail] Failed to fetch videos:', {
          status: response.status,
          error: errorMsg,
        });
        throw new Error(errorMsg);
      }

      console.log('✅ [CompanyTrainingDetail] Videos fetched:', {
        count: data.videos?.length || 0,
        videos: data.videos,
      });
      setVideos(data.videos || []);
    } catch (err) {
      console.error('❌ [CompanyTrainingDetail] Failed to fetch videos:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Videolar yüklenirken bir hata oluştu';
      toast.error(errorMessage);
      setVideos([]);
    }
  }, [id]);

  const fetchDocuments = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/trainings/${id}/documents`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Dökümanlar yüklenemedi');
      }

      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setDocuments([]);
    }
  }, [id]);

  const fetchProgress = React.useCallback(async () => {
    if (!user?.companyId || !training) {
      setLoading(false);
      return;
    }

    // Allow progress fetch even if videos or documents are empty (for trainings with only videos or only documents)
    // But if both are empty, set loading to false and return
    if (videos.length === 0 && documents.length === 0) {
      setProgress({
        overallProgress: 0,
        videos: [],
        documents: [],
      });
      setLoading(false);
      return;
    }

    try {
      // Fetch progress with calculation
      const response = await fetch(
        `/api/companies/${user.companyId}/trainings/${id}/progress?calculate=true`
      );

      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error('İlerleme bilgisi alınamadı: Geçersiz yanıt');
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || 'İlerleme bilgisi alınamadı';
        throw new Error(errorMessage);
      }

      // Ensure data exists
      if (!data) {
        throw new Error('İlerleme bilgisi alınamadı: Boş yanıt');
      }

      // Map progress data
      const overallProgress = data.overallProgress || 0;
      const videoProgressMap = new Map<string, VideoProgress>();
      const documentProgressMap = new Map<string, DocumentProgress>();

      // Sort videos and documents by orderIndex
      const sortedVideos = [...videos].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      const sortedDocuments = [...documents].sort(
        (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
      );

      // Initialize video progress with lock checking
      sortedVideos.forEach((video, index) => {
        let isLocked = video.isLocked;

        // Check sequential lock if training is locked
        if (training?.isLocked && index > 0) {
          const prevVideo = sortedVideos[index - 1];
          const prevVideoProgress = videoProgressMap.get(prevVideo.id);
          // Video is locked if previous video is not completed
          if (
            !prevVideoProgress ||
            !prevVideoProgress.watchedAt ||
            prevVideoProgress.progress < 100
          ) {
            isLocked = true;
          }
        }

        videoProgressMap.set(video.id, {
          videoId: video.id,
          progress: 0, // Will be updated from API
          watchedAt: null,
          isLocked,
        });
      });

      // Initialize document progress with lock checking
      sortedDocuments.forEach((doc, index) => {
        let isLocked = doc.isLocked;

        // Check sequential lock if training is locked
        if (training?.isLocked && index > 0) {
          const prevDoc = sortedDocuments[index - 1];
          const prevDocProgress = documentProgressMap.get(prevDoc.id);
          // Document is locked if previous document is not completed
          if (!prevDocProgress || !prevDocProgress.readAt || prevDocProgress.progress < 100) {
            isLocked = true;
          }
        }

        documentProgressMap.set(doc.id, {
          documentId: doc.id,
          progress: 0, // Will be updated from API
          readAt: null,
          isLocked,
        });
      });

      // Update from API response if available
      if (data.videos) {
        data.videos.forEach((vp: any) => {
          const existing = videoProgressMap.get(vp.videoId);
          if (existing) {
            videoProgressMap.set(vp.videoId, {
              ...existing,
              progress: vp.progress || 0,
              watchedAt: vp.watchedAt ? new Date(vp.watchedAt) : null,
            });
          }
        });
      }

      if (data.documents) {
        data.documents.forEach((dp: any) => {
          const existing = documentProgressMap.get(dp.documentId);
          if (existing) {
            documentProgressMap.set(dp.documentId, {
              ...existing,
              progress: dp.progress || 0,
              readAt: dp.readAt ? new Date(dp.readAt) : null,
            });
          }
        });
      }

      setProgress({
        overallProgress,
        videos: Array.from(videoProgressMap.values()),
        documents: Array.from(documentProgressMap.values()),
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
      // Set default progress with lock checking
      const sortedVideos = [...videos].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      const sortedDocuments = [...documents].sort(
        (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
      );

      setProgress({
        overallProgress: 0,
        videos: sortedVideos.map((v, index) => ({
          videoId: v.id,
          progress: 0,
          watchedAt: null,
          isLocked: training?.isLocked ? index > 0 || v.isLocked : v.isLocked,
        })),
        documents: sortedDocuments.map((d, index) => ({
          documentId: d.id,
          progress: 0,
          readAt: null,
          isLocked: training?.isLocked ? index > 0 || d.isLocked : d.isLocked,
        })),
      });
      setLoading(false);
    }
  }, [id, user?.companyId, videos, documents, training]);

  React.useEffect(() => {
    if (id && user?.companyId) {
      fetchTraining();
      fetchVideos();
      fetchDocuments();
    }
  }, [id, user?.companyId, fetchTraining, fetchVideos, fetchDocuments]);

  // Fetch progress after videos and documents are loaded
  React.useEffect(() => {
    if (training && user?.companyId) {
      // If both videos and documents are empty, set loading to false
      if (videos.length === 0 && documents.length === 0) {
        setProgress({
          overallProgress: 0,
          videos: [],
          documents: [],
        });
        setLoading(false);
      } else {
        // Otherwise, fetch progress
        fetchProgress();
      }
    }
  }, [videos, documents, training, user?.companyId, fetchProgress]);

  const handleVideoWatchComplete = async (videoId: string, progress: number) => {
    if (!user?.companyId) return;

    try {
      const response = await fetch(`/api/trainings/${id}/videos/${videoId}/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressPercentage: progress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video izleme kaydedilemedi');
      }

      toast.success('Video izleme kaydedildi');

      // Refresh progress
      await fetchProgress();
    } catch (err) {
      console.error('Failed to mark video as watched:', err);
      toast.error(err instanceof Error ? err.message : 'Video izleme kaydedilemedi');
    }
  };

  const handleDocumentReadComplete = async (documentId: string, progress: number) => {
    if (!user?.companyId) return;

    try {
      const response = await fetch(`/api/trainings/${id}/documents/${documentId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressPercentage: progress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Döküman okuma kaydedilemedi');
      }

      toast.success('Döküman okuma kaydedildi');

      // Refresh progress
      await fetchProgress();
    } catch (err) {
      console.error('Failed to mark document as read:', err);
      toast.error(err instanceof Error ? err.message : 'Döküman okuma kaydedilemedi');
    }
  };

  const getVideoProgress = (videoId: string): VideoProgress | undefined => {
    return progress?.videos.find((vp) => vp.videoId === videoId);
  };

  const getDocumentProgress = (documentId: string): DocumentProgress | undefined => {
    return progress?.documents.find((dp) => dp.documentId === documentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Eğitim yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Hata Oluştu
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Eğitim bulunamadı'}</p>
            <Button
              onClick={() => router.push('/company-dashboard/trainings')}
              variant="outline"
              className="shadow-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Eğitimlere Dön
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    archived: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  const statusLabels = {
    draft: 'Taslak',
    active: 'Aktif',
    archived: 'Arşivlendi',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {training.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={statusColors[training.status]}>
                {statusLabels[training.status]}
              </Badge>
              {training.isGlobal ? (
                <Badge variant="outline">Global Eğitim</Badge>
              ) : (
                <Badge variant="outline">Program Bazlı</Badge>
              )}
              {training.isLocked && (
                <Badge
                  variant="outline"
                  className="bg-orange-500/10 text-orange-500 border-orange-500/20"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Sıralı Erişim
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        {progress && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                <span>Genel İlerleme</span>
                <span className="text-2xl font-bold">{Math.round(progress.overallProgress)}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrainingProgressBar progress={progress.overallProgress} size="lg" />
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {training.description && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {training.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="w-full"
            >
              <TabsList className="bg-white dark:bg-gray-900">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Genel Bakış
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Videolar ({videos.length})
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Dökümanlar ({documents.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="w-full"
            >
              <TabsContent value="overview" className="mt-0 p-6 space-y-4">
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">
                      Eğitim Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Durum
                        </p>
                        <Badge className={statusColors[training.status]}>
                          {statusLabels[training.status]}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Tip
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {training.isGlobal ? 'Global Eğitim' : 'Program Bazlı Eğitim'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Oluşturulma
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(training.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Video className="h-5 w-5" />
                        Videolar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {videos.length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Toplam video sayısı
                      </p>
                      {progress && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Tamamlanan: {progress.videos.filter((v) => v.progress >= 100).length} /{' '}
                            {videos.length}
                          </p>
                          <TrainingProgressBar
                            progress={
                              videos.length > 0
                                ? (progress.videos.filter((v) => v.progress >= 100).length /
                                    videos.length) *
                                  100
                                : 0
                            }
                            size="sm"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <FileText className="h-5 w-5" />
                        Dökümanlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {documents.length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Toplam döküman sayısı
                      </p>
                      {progress && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Tamamlanan: {progress.documents.filter((d) => d.progress >= 100).length}{' '}
                            / {documents.length}
                          </p>
                          <TrainingProgressBar
                            progress={
                              documents.length > 0
                                ? (progress.documents.filter((d) => d.progress >= 100).length /
                                    documents.length) *
                                  100
                                : 0
                            }
                            size="sm"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="videos" className="mt-0 p-6 space-y-4">
                {videos.length === 0 ? (
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Video className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        Video Bulunamadı
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Bu eğitime henüz video eklenmemiş.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {videos.map((video) => {
                      const videoProgress = getVideoProgress(video.id);
                      return (
                        <TrainingVideoPlayer
                          key={video.id}
                          video={video}
                          isLocked={videoProgress?.isLocked || false}
                          progress={videoProgress?.progress || 0}
                          watchedAt={videoProgress?.watchedAt || null}
                          onWatchComplete={handleVideoWatchComplete}
                          className="w-full"
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-0 p-6 space-y-4">
                {documents.length === 0 ? (
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        Döküman Bulunamadı
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Bu eğitime henüz döküman eklenmemiş.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document) => {
                      const documentProgress = getDocumentProgress(document.id);
                      return (
                        <TrainingDocumentViewer
                          key={document.id}
                          document={document}
                          isLocked={documentProgress?.isLocked || false}
                          progress={documentProgress?.progress || 0}
                          readAt={documentProgress?.readAt || null}
                          onReadComplete={handleDocumentReadComplete}
                          className="w-full"
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
