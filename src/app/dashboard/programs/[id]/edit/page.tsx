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
import { ArrowLeft, Briefcase } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-lg font-medium text-destructive">{error || 'Program bulunamadı'}</p>
          <Button onClick={() => router.push('/dashboard/programs')}>Programlara Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Program Düzenle
            </h1>
            <p className="text-muted-foreground text-lg">
              {program.name} - Program bilgilerini güncelleyin
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              Program Bilgileri
            </CardTitle>
            <p className="text-muted-foreground">
              Program bilgilerini güncelleyin ve değişiklikleri kaydedin
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <ProgramForm program={program} onSubmit={handleSubmit} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
