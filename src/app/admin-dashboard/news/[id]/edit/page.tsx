'use client';

import { use } from 'react';
import { useNewsDetail, useUpdateNews } from '@/1-presentation/hooks/useNews';
import { NewsForm } from '@/1-presentation/components/features/news';
import { UpdateNewsDto } from '@/2-application/dtos/news';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: news, isLoading } = useNewsDetail(id);
  const updateNews = useUpdateNews();

  const handleUpdate = async (dto: UpdateNewsDto) => {
    try {
      await updateNews.mutateAsync({ id, dto });
      toast.success('Haber başarıyla güncellendi');
      router.push(`/admin-dashboard/news/${id}`);
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error('Haber güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Haber bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 rounded-2xl border border-destructive/30 bg-white dark:bg-gray-900/80 p-8 text-center">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Haber bulunamadı</h1>
            <p className="text-sm text-muted-foreground">
              Düzenlemek istediğiniz haber bulunamadı.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => router.push('/admin-dashboard/news')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Haberler Listesi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin-dashboard/news/${id}`)}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Haberi Düzenle
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{news.title}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Haber Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsForm
              programId={news.programId || ''}
              initialData={news}
              onSubmit={handleUpdate}
              isSubmitting={updateNews.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
