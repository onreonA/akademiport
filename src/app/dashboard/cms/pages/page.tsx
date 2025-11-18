/**
 * Admin CMS Pages List Page
 * Sprint 23: CMS
 */

'use client';

import { useState } from 'react';
import { CMSPageList } from '@/1-presentation/components/features/cms/CMSPageList';
import { CMSPageForm } from '@/1-presentation/components/features/cms/CMSPageForm';
import { useCreateCMSPage } from '@/1-presentation/hooks/useCMS';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminCMSPagesPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createPage = useCreateCMSPage();

  const handleCreate = async (data: any) => {
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

      await createPage.mutateAsync(dto);
      setIsCreateDialogOpen(false);
      toast.success('Sayfa oluşturuldu');
    } catch (error: any) {
      toast.error(error.message || 'Sayfa oluşturulamadı');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <CMSPageList
        showActions
        basePath="/dashboard/cms/pages"
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Sayfa Oluştur</DialogTitle>
          </DialogHeader>
          <CMSPageForm onSubmit={handleCreate} isSubmitting={createPage.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
