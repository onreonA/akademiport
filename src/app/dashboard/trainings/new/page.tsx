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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-4xl">
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
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Eğitim Oluştur
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Eğitim bilgilerini girin</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Eğitim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
    </div>
  );
}
