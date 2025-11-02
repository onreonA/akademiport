/**
 * New Training Page
 *
 * Page for creating a new training
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { TrainingForm, type TrainingFormData } from '@/presentation/components/features/trainings';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NewTrainingPage() {
  const router = useRouter();
  const [programs, setPrograms] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(true);

  React.useEffect(() => {
    fetchPrograms();
  }, []);

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
      const response = await fetch('/api/trainings', {
        method: 'POST',
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
        throw new Error(result.error || 'Eğitim oluşturulamadı');
      }

      toast.success('Eğitim başarıyla oluşturuldu');
      router.push('/dashboard/trainings');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Eğitim oluşturulurken bir hata oluştu';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Yeni Eğitim Oluştur</h1>
          <p className="text-muted-foreground">Eğitim bilgilerini girin</p>
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
            <TrainingForm programs={programs} onSubmit={handleSubmit} onCancel={handleCancel} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
