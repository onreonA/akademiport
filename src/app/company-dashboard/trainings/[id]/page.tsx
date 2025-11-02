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

  React.useEffect(() => {
    if (id && user?.companyId) {
      fetchTraining();
      fetchVideos();
      fetchDocuments();
    }
  }, [id, user?.companyId]);

  // Fetch progress after videos and documents are loaded
  React.useEffect(() => {
    if (videos.length > 0 && documents.length >= 0 && training && user?.companyId) {
      fetchProgress();
    }
  }, [videos, documents, training, user?.companyId]);

  const fetchTraining = async () => {
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
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/trainings/${id}/videos`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Videolar yüklenemedi');
      }

      setVideos(data.videos || []);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setVideos([]);
    }
  };

  const fetchDocuments = async () => {
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
  };

  const fetchProgress = async () => {
    if (!user?.companyId || videos.length === 0 || documents.length === 0) {
      // Wait for videos and documents to load
      if (videos.length > 0 || documents.length > 0) {
        // Videos or documents loaded, but we still need both
        // Try again after a short delay
        setTimeout(() => {
          if (videos.length > 0 && documents.length > 0) {
            fetchProgress();
          }
        }, 500);
      }
      return;
    }

    try {
      // Fetch progress with calculation
      const response = await fetch(
        `/api/companies/${user.companyId}/trainings/${id}/progress?calculate=true`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İlerleme bilgisi alınamadı');
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
  };

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg text-muted-foreground">Eğitim yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
                <p className="text-muted-foreground mb-4">{error || 'Eğitim bulunamadı'}</p>
                <Button
                  onClick={() => router.push('/company-dashboard/trainings')}
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Eğitimlere Dön
                </Button>
              </div>
            </div>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">{training.name}</h1>
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
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
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
          <Card>
            <CardHeader>
              <CardTitle>Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{training.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="mr-2 h-4 w-4" />
              Videolar ({videos.length})
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Dökümanlar ({documents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eğitim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Durum</p>
                    <Badge className={statusColors[training.status]}>
                      {statusLabels[training.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tip</p>
                    <p className="text-sm">
                      {training.isGlobal ? 'Global Eğitim' : 'Program Bazlı Eğitim'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Oluşturulma</p>
                  <p className="text-sm">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Videolar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{videos.length}</p>
                  <p className="text-sm text-muted-foreground">Toplam video sayısı</p>
                  {progress && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dökümanlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{documents.length}</p>
                  <p className="text-sm text-muted-foreground">Toplam döküman sayısı</p>
                  {progress && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Tamamlanan: {progress.documents.filter((d) => d.progress >= 100).length} /{' '}
                        {documents.length}
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

          <TabsContent value="videos" className="space-y-4">
            {videos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Video Bulunamadı</h3>
                  <p className="text-muted-foreground">Bu eğitime henüz video eklenmemiş.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {videos.map((video, index) => {
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

          <TabsContent value="documents" className="space-y-4">
            {documents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Döküman Bulunamadı</h3>
                  <p className="text-muted-foreground">Bu eğitime henüz döküman eklenmemiş.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {documents.map((document, index) => {
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
      </div>
    </div>
  );
}
