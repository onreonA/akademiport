'use client';

import { useState } from 'react';
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
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewSubProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'todo',
    orderIndex: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sub-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sub-project');
      }

      toast.success('Alt proje başarıyla oluşturuldu!');
      router.push(`/consultant-dashboard/projects/${projectId}`);
    } catch (error) {
      console.error('Error creating sub-project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <GradientHeader
          title="Yeni Alt Proje"
          subtitle="Projeye yeni bir alt proje ekleyin"
          icon={Plus}
          actions={
            <Link href={`/consultant-dashboard/projects/${projectId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
          }
        />

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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={loading}
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
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Alt projenin görüntülenme sırası (0 = en üstte)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={loading || !formData.name} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Alt Proje Oluştur
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/consultant-dashboard/projects/${projectId}`)}
                disabled={loading}
              >
                İptal
              </Button>
            </div>
          </form>
        </EnhancedCard>

        {/* Info Card */}
        <EnhancedCard className="bg-blue-50/50 border-blue-200">
          <div className="flex gap-3">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-blue-900">Alt Proje Hakkında</h3>
              <p className="text-sm text-blue-700">
                Alt projeler, ana projenizi daha küçük ve yönetilebilir parçalara ayırmanıza
                yardımcı olur. Her alt proje kendi görevlerine sahip olabilir ve bağımsız olarak
                takip edilebilir.
              </p>
            </div>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
