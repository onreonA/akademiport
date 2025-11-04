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
import {
  ProgramForm,
  type ProgramFormData,
} from '@/presentation/components/features/programs/ProgramForm';
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
              Yeni Program Oluştur
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              E-ihracat dönüşüm programı bilgilerini girin
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Program Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ProgramForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
