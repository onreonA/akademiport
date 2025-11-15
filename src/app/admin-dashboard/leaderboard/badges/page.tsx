'use client';

import { useState } from 'react';
import { BadgeGallery } from '@/1-presentation/components/features/leaderboard';
import { BadgeForm } from '@/1-presentation/components/features/leaderboard/BadgeForm';
import {
  useCreateBadge,
  useUpdateBadge,
  useDeleteBadge,
  useBadges,
} from '@/1-presentation/hooks/useLeaderboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Badge as BadgeEntity } from '@/3-domain/entities/Leaderboard';
import { CreateBadgeDto, UpdateBadgeDto } from '@/2-application/dtos/leaderboard';
import { toast } from 'sonner';

export default function AdminBadgesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeEntity | null>(null);
  const [deletingBadge, setDeletingBadge] = useState<BadgeEntity | null>(null);

  const createBadge = useCreateBadge();
  const updateBadge = useUpdateBadge();
  const deleteBadge = useDeleteBadge();
  const { data: badgesData, refetch } = useBadges(undefined, true);

  const badges = badgesData?.badges || [];

  const handleCreate = async (data: CreateBadgeDto | UpdateBadgeDto) => {
    try {
      // Type guard: ensure it's CreateBadgeDto
      if (
        !('name' in data && data.name) ||
        !('category' in data && data.category) ||
        !('requirementType' in data && data.requirementType) ||
        !('requirementValue' in data && data.requirementValue)
      ) {
        toast.error('Eksik bilgiler var');
        return;
      }
      // Clean null values and convert enums to strings
      const cleanedData = {
        name: data.name,
        category: String(data.category),
        requirementType: String(data.requirementType),
        requirementValue: data.requirementValue,
        description: data.description ?? undefined,
        icon: data.icon ?? undefined,
        requirementActivity: data.requirementActivity ?? undefined,
        pointsBonus: data.pointsBonus,
        isActive: data.isActive,
        orderIndex: data.orderIndex,
      };
      await createBadge.mutateAsync(cleanedData);
      toast.success('Rozet oluşturuldu');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Rozet oluşturulamadı');
    }
  };

  const handleUpdate = async (data: Partial<CreateBadgeDto>) => {
    if (!editingBadge) return;

    try {
      await updateBadge.mutateAsync({
        badgeId: editingBadge.id,
        data: data as any,
      });
      toast.success('Rozet güncellendi');
      setEditingBadge(null);
      refetch();
    } catch (error) {
      toast.error('Rozet güncellenemedi');
    }
  };

  const handleDelete = async () => {
    if (!deletingBadge) return;

    if (!confirm(`"${deletingBadge.name}" rozetini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await deleteBadge.mutateAsync(deletingBadge.id);
      toast.success('Rozet silindi');
      setDeletingBadge(null);
      refetch();
    } catch (error) {
      toast.error('Rozet silinemedi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rozet Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Sistem rozetlerini oluşturun, düzenleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Rozet
        </Button>
      </div>

      {/* Badges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="text-4xl">{badge.icon || '🏆'}</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingBadge(badge)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeletingBadge(badge)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold text-lg">{badge.name}</h3>
            {badge.description && (
              <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {badge.pointsBonus > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  +{badge.pointsBonus} bonus
                </span>
              )}
              {!badge.isActive && <span className="text-xs bg-muted px-2 py-1 rounded">Pasif</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Rozet Oluştur</DialogTitle>
          </DialogHeader>
          <BadgeForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={createBadge.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingBadge} onOpenChange={(open) => !open && setEditingBadge(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rozet Düzenle</DialogTitle>
          </DialogHeader>
          {editingBadge && (
            <BadgeForm
              badge={editingBadge}
              onSubmit={handleUpdate}
              onCancel={() => setEditingBadge(null)}
              isSubmitting={updateBadge.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingBadge} onOpenChange={(open) => !open && setDeletingBadge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rozet Sil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              &quot;{deletingBadge?.name}&quot; rozetini silmek istediğinizden emin misiniz? Bu
              işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeletingBadge(null)}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteBadge.isPending}>
                {deleteBadge.isPending ? 'Siliniyor...' : 'Sil'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
