'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Proje Şablonu Oluştur
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Yeniden kullanılabilir bir proje şablonu oluşturun
            </p>
          </div>
        </div>

        <EnhancedCard
          variant="default"
          className="p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                Şablon Adı <span className="text-red-600 dark:text-red-400">*</span>
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
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                Açıklama
              </Label>
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
              <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">
                Varsayılan Durum
              </Label>
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
              <Label htmlFor="priority" className="text-gray-700 dark:text-gray-300">
                Varsayılan Öncelik
              </Label>
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
            <div className="flex flex-col-reverse gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="w-full sm:w-auto bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-none transition-colors"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 shadow-sm transition-colors"
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
        <EnhancedCard
          variant="default"
          className="border-l-4 border-l-primary p-4 border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">💡 Bilgi</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Şablon oluşturduktan sonra, alt projeler ve görevler ekleyerek detaylandırabilirsiniz.
              Bu şablon, yeni firmalar için proje oluştururken kullanılabilir.
            </p>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
