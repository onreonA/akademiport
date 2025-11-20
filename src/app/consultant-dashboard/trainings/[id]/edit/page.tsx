/**
 * Edit Training Page (Consultant)
 *
 * Page for editing an existing training as a consultant
 */

'use client';

import * as React from 'react';
import { useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  TrainingForm,
  type TrainingFormData,
  TrainingVideoManager,
  TrainingDocumentManager,
} from '@/presentation/components/features/trainings';
import { ArrowLeft, FileText, Video, Settings } from 'lucide-react';
import { toast } from 'sonner';
import type { Training } from '@/domain/entities/Training';
import type { TrainingVideo } from '@/domain/entities/TrainingVideo';
import type { TrainingDocument } from '@/domain/entities/TrainingDocument';

export default function EditTrainingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [training, setTraining] = React.useState<Training | null>(null);
  const [programs, setPrograms] = React.useState<Array<{ id: string; name: string }>>([]);
  const [videos, setVideos] = React.useState<TrainingVideo[]>([]);
  const [documents, setDocuments] = React.useState<TrainingDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingPrograms, setLoadingPrograms] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('general');

  const fetchTraining = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trainings/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eğitim bulunamadı');
      }

      setTraining(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Eğitim yüklenirken bir hata oluştu';
      toast.error(errorMessage);
      router.push('/consultant-dashboard/trainings');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPrograms = React.useCallback(async () => {
    try {
      setLoadingPrograms(true);
      // Consultant can only see programs they're assigned to
      const response = await fetch('/api/consultant/programs');
      const data = await response.json();

      if (response.ok && data.programs) {
        setPrograms(data.programs.map((p: any) => ({ id: p.id, name: p.name })) || []);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoadingPrograms(false);
    }
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/trainings/${id}/videos`);
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/trainings/${id}/documents`);
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleSubmit = async (data: TrainingFormData) => {
    try {
      const response = await fetch(`/api/trainings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          programId: data.programId || null,
          isGlobal: data.isGlobal,
          status: data.status,
          priority: data.priority,
          isLocked: data.isLocked,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Eğitim güncellenemedi');
      }

      toast.success('Eğitim başarıyla güncellendi');
      router.push('/consultant-dashboard/trainings');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Eğitim güncellenirken bir hata oluştu';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleCancel = () => {
    router.back();
  };

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

  if (!training) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Eğitimi Düzenle</h1>
          <p className="text-muted-foreground">{training.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            Genel Bilgiler
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="mr-2 h-4 w-4" />
            Videolar ({videos.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Dökümanlar ({documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Eğitim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPrograms ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <TrainingForm
                  training={training}
                  programs={programs}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Video Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <TrainingVideoManager
                trainingId={id}
                videos={videos}
                onRefresh={() => {
                  fetchVideos();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Döküman Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <TrainingDocumentManager
                trainingId={id}
                documents={documents}
                onRefresh={() => {
                  fetchDocuments();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
