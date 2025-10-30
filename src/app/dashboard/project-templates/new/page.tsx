'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';
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

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export default function NewProjectTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isTemplate: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create template');
      }

      router.push('/dashboard/project-templates');
      router.refresh();
    } catch (error) {
      console.error('Error creating template:', error);
      alert(error instanceof Error ? error.message : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <GradientHeader
          icon={Building2}
          title="Yeni Proje Şablonu"
          subtitle="Yeniden kullanılabilir bir proje şablonu oluşturun"
          progress={0}
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
                placeholder="Örn: Dijital Dönüşüm Projesi"
                required
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
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Varsayılan Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
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

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Varsayılan Öncelik</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: ProjectPriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="critical">Kritik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-linear-to-r from-primary to-secondary hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  'Şablon Oluştur'
                )}
              </Button>
            </div>
          </form>
        </EnhancedCard>

        {/* Info Card */}
        <EnhancedCard variant="default" className="border-l-4 border-l-primary p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">💡 Bilgi</h3>
            <p className="text-sm text-muted-foreground">
              Şablon oluşturduktan sonra, alt projeler ve görevler ekleyerek detaylandırabilirsiniz.
              Bu şablon, yeni firmalar için proje oluştururken kullanılabilir.
            </p>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
