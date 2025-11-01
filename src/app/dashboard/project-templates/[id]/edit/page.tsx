'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Label } from '@/presentation/components/ui/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { toast } from 'sonner';
import Link from 'next/link';

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

interface Template {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: string;
  updatedAt: string;
}

export default function EditProjectTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
  });

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      const data = await response.json();
      setTemplate(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Şablon yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isTemplate: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update template');
      }

      toast.success('Şablon başarıyla güncellendi!');
      router.push('/dashboard/project-templates');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu şablonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete template');
      }

      toast.success('Şablon başarıyla silindi!');
      router.push('/dashboard/project-templates');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Şablon yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Şablon bulunamadı</p>
          <Link href="/dashboard/project-templates">
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <GradientHeader
          icon={Building2}
          title="Şablon Düzenle"
          subtitle={template.name}
          progress={0}
          actions={
            <Link href="/dashboard/project-templates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
          }
        />

        <EnhancedCard variant="glass" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Şablon Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: E-İhracat Başlangıç Şablonu"
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
                placeholder="Şablon hakkında detaylı açıklama..."
                rows={4}
                disabled={saving || deleting}
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as ProjectStatus })
                  }
                  disabled={saving || deleting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planlama</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="on_hold">Beklemede</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value as ProjectPriority })
                  }
                  disabled={saving || deleting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info */}
            <EnhancedCard className="bg-blue-50/50 border-blue-200 p-4">
              <p className="text-sm text-blue-700">
                <strong>Not:</strong> Bu şablonu düzenlediğinizde, mevcut projeler etkilenmez.
                Yalnızca yeni projeler oluşturulurken bu güncellenmiş şablon kullanılır.
              </p>
            </EnhancedCard>

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
                onClick={() => router.push('/dashboard/project-templates')}
                disabled={saving || deleting}
              >
                İptal
              </Button>
            </div>
          </form>
        </EnhancedCard>

        {/* Delete Section */}
        <EnhancedCard variant="glass" className="border-red-200 bg-red-50/50 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-900">Tehlikeli Bölge</h3>
              <p className="text-sm text-red-700 mt-1">
                Şablonu silerseniz, bu işlem geri alınamaz. Bu şablondan oluşturulmuş projeler
                etkilenmez.
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
                  Şablonu Sil
                </>
              )}
            </Button>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
