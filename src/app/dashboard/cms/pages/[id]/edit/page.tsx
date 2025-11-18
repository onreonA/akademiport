/**
 * Admin CMS Page Edit Page
 * Sprint 23: CMS
 */

'use client';

import { use } from 'react';
import { useCMSPage, useUpdateCMSPage } from '@/1-presentation/hooks/useCMS';
import { CMSPageForm } from '@/1-presentation/components/features/cms/CMSPageForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminCMSPageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: page, isLoading } = useCMSPage(id);
  const updatePage = useUpdateCMSPage();

  const handleUpdate = async (data: any) => {
    try {
      const dto = {
        ...data,
        metaKeywords: data.metaKeywords
          ? data.metaKeywords
              .split(',')
              .map((k: string) => k.trim())
              .filter(Boolean)
          : undefined,
        ogImageUrl: data.ogImageUrl || undefined,
        canonicalUrl: data.canonicalUrl || undefined,
        content: data.content ? JSON.parse(data.content) : [],
      };

      await updatePage.mutateAsync({ id, ...dto });
      toast.success('Sayfa güncellendi');
      router.push('/dashboard/cms/pages');
    } catch (error: any) {
      toast.error(error.message || 'Sayfa güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sayfa bulunamadı</p>
        <Button onClick={() => router.push('/dashboard/cms/pages')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/cms/pages')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Sayfa Düzenle</h1>
          <p className="text-sm text-muted-foreground">{page.title}</p>
        </div>
      </div>

      <CMSPageForm initialData={page} onSubmit={handleUpdate} isSubmitting={updatePage.isPending} />
    </div>
  );
}
