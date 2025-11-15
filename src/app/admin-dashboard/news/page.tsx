'use client';

import { useState } from 'react';
import { NewsList } from '@/1-presentation/components/features/news';
import { NewsForm } from '@/1-presentation/components/features/news';
import { useCreateNews } from '@/1-presentation/hooks/useNews';
import { CreateNewsDto, UpdateNewsDto } from '@/2-application/dtos/news';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { useRouter } from 'next/navigation';

export default function AdminNewsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createNews = useCreateNews();

  const handleCreate = async (dto: CreateNewsDto | UpdateNewsDto) => {
    // Only handle CreateNewsDto for this page
    if ('programId' in dto && 'authorId' in dto) {
      await createNews.mutateAsync(dto as CreateNewsDto);
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <NewsList
        showActions
        basePath="/admin-dashboard/news"
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Haber Oluştur</DialogTitle>
          </DialogHeader>
          <NewsForm
            programId="" // Admin can select program in future enhancement
            onSubmit={handleCreate}
            isSubmitting={createNews.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

