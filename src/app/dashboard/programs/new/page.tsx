/**
 * New Program Page
 * 
 * Page for creating a new program
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { ProgramForm, type ProgramFormData } from '@/presentation/components/features/programs/ProgramForm';
import { ArrowLeft } from 'lucide-react';

export default function NewProgramPage() {
  const router = useRouter();

  const handleSubmit = async (data: ProgramFormData) => {
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Program oluşturulamadı');
      }

      // Success! Redirect to programs list
      router.push('/dashboard/programs');
    } catch (error) {
      // Show error to user
      alert(error instanceof Error ? error.message : 'Program oluşturulurken bir hata oluştu');
      throw error; // Re-throw to keep form in loading state
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
          <h1 className="text-3xl font-bold">Yeni Program Oluştur</h1>
          <p className="text-muted-foreground">
            E-ihracat dönüşüm programı bilgilerini girin
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Program Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}

