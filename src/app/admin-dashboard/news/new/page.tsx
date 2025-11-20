'use client';

import { useState } from 'react';
import { NewsForm } from '@/1-presentation/components/features/news';
import { useCreateNews } from '@/1-presentation/hooks/useNews';
import { CreateNewsDto } from '@/2-application/dtos/news';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminNewNewsPage() {
  const router = useRouter();
  const createNews = useCreateNews();

  const handleCreate = async (dto: CreateNewsDto | any) => {
    try {
      // API route automatically sets authorId from authenticated user
      // programId can be empty for admin-created news (not tied to a specific program)
      const createDto: CreateNewsDto = {
        ...dto,
        programId: dto.programId || '', // Admin can select program in future enhancement
        authorId: '', // Will be set by backend from authenticated user (see /api/news/route.ts)
      };

      const result = await createNews.mutateAsync(createDto);
      toast.success('Haber başarıyla oluşturuldu');
      router.push(`/admin-dashboard/news/${result.id}`);
    } catch (error) {
      console.error('Error creating news:', error);
      const errorMessage = error instanceof Error ? error.message : 'Haber oluşturulamadı';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin-dashboard/news')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Yeni Haber Oluştur
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Yeni bir haber oluşturun ve yayınlayın
              </p>
            </div>
          </div>
        </div>

        {/* Create Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Haber Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsForm
              programId="" // Admin can select program in future enhancement
              onSubmit={handleCreate}
              isSubmitting={createNews.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
