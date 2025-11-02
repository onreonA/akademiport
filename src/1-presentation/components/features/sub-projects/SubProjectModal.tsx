'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { toast } from 'sonner';

interface SubProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  order_index: number;
}

interface SubProjectModalProps {
  projectId: string;
  subProject?: SubProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function SubProjectModal({
  projectId,
  subProject,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: SubProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'todo',
    order_index: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (subProject) {
      setFormData({
        name: subProject.name || '',
        description: subProject.description || '',
        status: subProject.status || 'todo',
        order_index: subProject.order_index || 0,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'todo',
        order_index: 0,
      });
    }
  }, [subProject, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Alt proje adı zorunludur.');
      return;
    }

    try {
      setSubmitting(true);

      const url = subProject ? `/api/sub-projects/${subProject.id}` : '/api/sub-projects';

      const method = subProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          name: formData.name,
          description: formData.description || null,
          status: formData.status,
          orderIndex: formData.order_index,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save sub-project');
      }

      toast.success(subProject ? 'Alt proje güncellendi.' : 'Alt proje oluşturuldu.');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving sub-project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{subProject ? 'Alt Proje Düzenle' : 'Yeni Alt Proje'}</DialogTitle>
          <DialogDescription>
            {subProject
              ? 'Alt proje bilgilerini güncelleyin'
              : 'Projeye yeni bir alt proje ekleyin'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Alt Proje Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alt proje adı"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Alt proje açıklaması"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Yapılacak</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="review">İncelemede</SelectItem>
                  <SelectItem value="done">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="order_index">Sıra</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })
                }
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Kaydediliyor...' : subProject ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
