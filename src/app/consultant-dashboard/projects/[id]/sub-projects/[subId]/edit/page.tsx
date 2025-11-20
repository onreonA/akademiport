'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Input } from '@/1-presentation/components/ui/atoms/input';
import { Label } from '@/1-presentation/components/ui/atoms/label';
import { Textarea } from '@/1-presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/1-presentation/components/ui/atoms/select';
import { GradientHeader } from '@/1-presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/1-presentation/components/ui/atoms/enhanced-card';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SubProject {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: string;
  orderIndex: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditSubProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const subProjectId = params.subId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subProject, setSubProject] = useState<SubProject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'todo',
    orderIndex: 0,
  });

  const fetchSubProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/sub-projects/${subProjectId}`);
      if (!response.ok) throw new Error('Failed to fetch sub-project');

      const data = await response.json();
      setSubProject(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        status: data.status,
        orderIndex: data.orderIndex,
      });
    } catch (error) {
      console.error('Error fetching sub-project:', error);
      toast.error('Alt proje yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [subProjectId]);

  useEffect(() => {
    fetchSubProject();
  }, [fetchSubProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/sub-projects/${subProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update sub-project');
      }

      toast.success('Alt proje başarıyla güncellendi!');
      router.push(`/consultant-dashboard/projects/${projectId}`);
    } catch (error) {
      console.error('Error updating sub-project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu alt projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/sub-projects/${subProjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sub-project');
      }

      toast.success('Alt proje başarıyla silindi!');
      router.push(`/consultant-dashboard/projects/${projectId}`);
    } catch (error) {
      console.error('Error deleting sub-project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Alt proje yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!subProject) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Alt proje bulunamadı</p>
          <Link href={`/consultant-dashboard/projects/${projectId}`}>
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <GradientHeader
          title="Alt Proje Düzenle"
          subtitle={subProject.name}
          icon={Save}
          actions={
            <Link href={`/consultant-dashboard/projects/${projectId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
          }
        />

        {/* Progress Info */}
        <EnhancedCard className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">İlerleme</p>
              <p className="text-2xl font-bold text-blue-600">%{subProject.progress}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Oluşturulma</p>
              <p className="text-sm font-medium">
                {new Date(subProject.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </EnhancedCard>

        {/* Form */}
        <EnhancedCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Alt Proje Adı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Analiz Aşaması"
                required
                disabled={saving || deleting}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Alt proje hakkında detaylı açıklama..."
                rows={4}
                disabled={saving || deleting}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={saving || deleting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Yapılacak</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="review">İncelemede</SelectItem>
                  <SelectItem value="done">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Index */}
            <div className="space-y-2">
              <Label htmlFor="orderIndex">Sıra</Label>
              <Input
                id="orderIndex"
                type="number"
                value={formData.orderIndex}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orderIndex: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                disabled={saving || deleting}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={saving || deleting || !formData.name}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/consultant-dashboard/projects/${projectId}`)}
                disabled={saving || deleting}
              >
                İptal
              </Button>
            </div>
          </form>
        </EnhancedCard>

        {/* Delete Section */}
        <EnhancedCard className="border-red-200 bg-red-50/50">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-900">Tehlikeli Bölge</h3>
              <p className="text-sm text-red-700 mt-1">
                Alt projeyi silerseniz, bu işlem geri alınamaz. Tüm görevler de silinecektir.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Alt Projeyi Sil
                </>
              )}
            </Button>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
