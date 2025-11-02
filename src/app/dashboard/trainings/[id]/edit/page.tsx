/**
 * Edit Training Page
 *
 * Page for editing an existing training
 */

'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { TrainingForm, type TrainingFormData } from '@/presentation/components/features/trainings';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Training } from '@/domain/entities/Training';

export default function EditTrainingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [training, setTraining] = React.useState<Training | null>(null);
  const [programs, setPrograms] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingPrograms, setLoadingPrograms] = React.useState(true);

  React.useEffect(() => {
    fetchTraining();
    fetchPrograms();
  }, [id]);

  const fetchTraining = async () => {
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
      router.push('/dashboard/trainings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const response = await fetch('/api/programs?status=active');
      const data = await response.json();

      if (data.success) {
        setPrograms(data.data?.map((p: any) => ({ id: p.id, name: p.name })) || []);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoadingPrograms(false);
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
      router.push('/dashboard/trainings');
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

      {/* Form Card */}
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
    </div>
  );
}
