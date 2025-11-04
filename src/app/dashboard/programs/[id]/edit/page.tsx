/**
 * Edit Program Page
 *
 * Page for editing an existing program
 */

'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import {
  ProgramForm,
  type ProgramFormData,
} from '@/presentation/components/features/programs/ProgramForm';
import { ArrowLeft, Briefcase, AlertCircle } from 'lucide-react';
import type { Program } from '@/domain/entities/Program';

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [program, setProgram] = React.useState<Program | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/programs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Program yüklenemedi');
        }

        setProgram(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  const handleSubmit = async (data: ProgramFormData) => {
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Program güncellenemedi');
      }

      // Success! Redirect to program detail
      router.push(`/dashboard/programs/${id}`);
    } catch (error) {
      // Show error to user
      alert(error instanceof Error ? error.message : 'Program güncellenirken bir hata oluştu');
      throw error; // Re-throw to keep form in loading state
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {error || 'Program Bulunamadı'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'Program bilgileri yüklenemedi'}
            </p>
            <Button onClick={() => router.push('/dashboard/programs')}>Programlara Dön</Button>
          </div>
        </div>
      </div>
    );
  }

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
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Program Düzenle</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {program.name} - Program bilgilerini güncelleyin
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Program Bilgileri
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Program bilgilerini güncelleyin ve değişiklikleri kaydedin
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ProgramForm program={program} onSubmit={handleSubmit} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
