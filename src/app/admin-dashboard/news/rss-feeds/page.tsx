'use client';

import { useState } from 'react';
import { RSSFeedList } from '@/1-presentation/components/features/rss';
import { RSSFeedForm } from '@/1-presentation/components/features/rss';
import {
  useCreateRSSFeed,
  useUpdateRSSFeed,
  useRSSFeeds,
  CreateRSSFeedDto,
  UpdateRSSFeedDto,
} from '@/1-presentation/hooks/useRSSFeeds';
import { RSSFeed } from '@/3-domain/entities/RSSFeed';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { toast } from 'sonner';

export default function AdminRSSFeedsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RSSFeed | null>(null);
  const createFeed = useCreateRSSFeed();
  const updateFeed = useUpdateRSSFeed();
  const { refetch } = useRSSFeeds();

  const handleCreate = async (dto: CreateRSSFeedDto | UpdateRSSFeedDto) => {
    try {
      if (editingFeed) {
        await updateFeed.mutateAsync({ id: editingFeed.id, ...dto });
        toast.success('RSS feed güncellendi');
      } else {
        await createFeed.mutateAsync(dto as CreateRSSFeedDto);
        toast.success('RSS feed oluşturuldu');
      }
      setIsCreateDialogOpen(false);
      setEditingFeed(null);
      refetch();
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleEdit = (feed: RSSFeed) => {
    setEditingFeed(feed);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <RSSFeedList
        showActions
        onCreateClick={() => {
          setEditingFeed(null);
          setIsCreateDialogOpen(true);
        }}
        onEditClick={handleEdit}
      />

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingFeed(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFeed ? 'RSS Feed Düzenle' : 'Yeni RSS Feed Oluştur'}</DialogTitle>
          </DialogHeader>
          <RSSFeedForm
            initialData={editingFeed || undefined}
            onSubmit={handleCreate}
            isSubmitting={createFeed.isPending || updateFeed.isPending}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setEditingFeed(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
