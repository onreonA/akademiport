/**
 * Consultant Training Detail Page
 * Sprint 9: Training Management
 *
 * Consultant'ın bir eğitimin detaylarını görüntüleme sayfası
 */

'use client';

import * as React from 'react';
import { useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, GraduationCap, Video, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  TrainingVideoPlayer,
  TrainingDocumentViewer,
} from '@/presentation/components/features/trainings';
import { TrainingSummaryGenerator } from '@/1-presentation/components/features/ai/TrainingSummaryGenerator';
import type { Training } from '@/domain/entities/Training';
import type { TrainingVideo } from '@/domain/entities/TrainingVideo';
import type { TrainingDocument } from '@/domain/entities/TrainingDocument';
import { toast } from 'sonner';

export default function ConsultantTrainingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [training, setTraining] = React.useState<Training | null>(null);
  const [videos, setVideos] = React.useState<TrainingVideo[]>([]);
  const [documents, setDocuments] = React.useState<TrainingDocument[]>([]);
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

      setTraining(data.training || data); // Handle both { training: ... } and direct training object
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Eğitim yüklenirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to be handled by Promise.allSettled
    }
  }, [id]);

  const fetchVideos = React.useCallback(async () => {
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
      // Don't throw - videos are optional
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
      // Don't throw - documents are optional
    }
  }, [id]);

  // Fetch all data when component mounts
  React.useEffect(() => {
    if (!id) {
      setError('Eğitim ID bulunamadı');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel, but don't fail if videos/documents fail
      const results = await Promise.allSettled([fetchTraining(), fetchVideos(), fetchDocuments()]);

      // Check if training fetch failed
      if (results[0].status === 'rejected') {
        // Error already set by fetchTraining
        setLoading(false);
        return;
      }

      // All data loaded successfully
      setLoading(false);
    };

    loadData();
  }, [id, fetchTraining, fetchVideos, fetchDocuments]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="text-lg text-muted-foreground">Eğitim yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
              <p className="text-muted-foreground mb-4">{error || 'Eğitim bulunamadı'}</p>
              <Button
                onClick={() => router.push('/consultant-dashboard/trainings')}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Eğitimlere Dön
              </Button>
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

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const statusLabels = {
    draft: 'Taslak',
    active: 'Aktif',
    archived: 'Arşivlendi',
  };

  const priorityLabels = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    critical: 'Kritik',
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
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
            <Badge className={statusColors[training.status]}>{statusLabels[training.status]}</Badge>
            <Badge className={priorityColors[training.priority]}>
              {priorityLabels[training.priority]}
            </Badge>
            {training.isGlobal ? (
              <Badge variant="outline">Global Eğitim</Badge>
            ) : (
              <Badge variant="outline">Program Bazlı</Badge>
            )}
            {training.isLocked && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                Kilitli
              </Badge>
            )}
          </div>
        </div>
      </div>

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
          {/* AI Summary Generator */}
          <TrainingSummaryGenerator trainingId={id} />

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
                  <p className="text-sm font-medium text-muted-foreground mb-1">Öncelik</p>
                  <Badge className={priorityColors[training.priority]}>
                    {priorityLabels[training.priority]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tip</p>
                  <p className="text-sm">
                    {training.isGlobal ? 'Global Eğitim' : 'Program Bazlı Eğitim'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Kilitli</p>
                  <p className="text-sm">{training.isLocked ? 'Evet' : 'Hayır'}</p>
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
              {videos.map((video, index) => (
                <TrainingVideoPlayer
                  key={video.id}
                  video={video}
                  isLocked={false} // Consultant can view all videos
                  progress={0}
                  className="w-full"
                />
              ))}
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
              {documents.map((document, index) => (
                <TrainingDocumentViewer
                  key={document.id}
                  document={document}
                  isLocked={false} // Consultant can view all documents
                  progress={0}
                  className="w-full"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
