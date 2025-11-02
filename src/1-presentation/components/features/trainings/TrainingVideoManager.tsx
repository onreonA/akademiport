'use client';

/**
 * Training Video Manager Component
 *
 * Component for managing training videos (list, add, edit, delete)
 */

import * as React from 'react';
import { Plus, Edit, Trash2, Video, Lock, Unlock, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Checkbox } from '@/presentation/components/ui/atoms/checkbox';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { toast } from 'sonner';
import type { TrainingVideo } from '@/domain/entities/TrainingVideo';

interface TrainingVideoManagerProps {
  trainingId: string;
  videos: TrainingVideo[];
  onRefresh: () => void;
}

export function TrainingVideoManager({
  trainingId,
  videos: initialVideos,
  onRefresh,
}: TrainingVideoManagerProps) {
  const [videos, setVideos] = React.useState<TrainingVideo[]>(initialVideos);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingVideo, setEditingVideo] = React.useState<TrainingVideo | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    youtubeUrl: '',
    orderIndex: videos.length,
    isLocked: false,
  });

  React.useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      orderIndex: videos.length,
      isLocked: false,
    });
    setEditingVideo(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (video: TrainingVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtubeUrl: video.youtubeUrl,
      orderIndex: video.orderIndex,
      isLocked: video.isLocked,
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      orderIndex: videos.length,
      isLocked: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingVideo
        ? `/api/trainings/${trainingId}/videos/${editingVideo.id}`
        : `/api/trainings/${trainingId}/videos`;

      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          youtubeUrl: formData.youtubeUrl,
          orderIndex: formData.orderIndex,
          isLocked: formData.isLocked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video kaydedilemedi');
      }

      toast.success(editingVideo ? 'Video başarıyla güncellendi' : 'Video başarıyla eklendi');
      handleCloseModal();
      onRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Video kaydedilirken bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trainings/${trainingId}/videos/${videoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video silinemedi');
      }

      toast.success('Video başarıyla silindi');
      onRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Video silinirken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  const sortedVideos = [...videos].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Videolar</h3>
          <p className="text-sm text-muted-foreground">
            {videos.length} video {videos.length === 1 ? 'eklenmiş' : 'eklenmiş'}
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddModal} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Video Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Videoyu Düzenle' : 'Yeni Video Ekle'}</DialogTitle>
              <DialogDescription>
                YouTube video URL'si ekleyin. Video unlisted olmalıdır.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Video başlığı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Video açıklaması (opsiyonel)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  YouTube video URL'si (watch, embed veya youtu.be formatı)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderIndex">Sıra</Label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) =>
                    setFormData({ ...formData, orderIndex: parseInt(e.target.value, 10) || 0 })
                  }
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Video sırası (0 = ilk video, daha yüksek sayı = daha sonra)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isLocked"
                  checked={formData.isLocked}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isLocked: checked === true })
                  }
                />
                <Label htmlFor="isLocked" className="text-sm font-normal cursor-pointer">
                  Kilitli (Önceki video tamamlanmadan bu video açılmaz)
                </Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  İptal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Kaydediliyor...' : editingVideo ? 'Güncelle' : 'Ekle'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos List */}
      {sortedVideos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Video Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">Bu eğitime henüz video eklenmemiş.</p>
            <Button onClick={handleOpenAddModal} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              İlk Videoyu Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedVideos.map((video, index) => (
            <Card key={video.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold">{video.title}</h4>
                      {video.isLocked && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="mr-1 h-3 w-3" />
                          Kilitli
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Sıra: {video.orderIndex}
                      </Badge>
                    </div>
                    {video.description && (
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate max-w-md">{video.youtubeUrl}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(video)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(video.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
