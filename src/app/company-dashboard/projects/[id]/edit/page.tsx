'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

interface Project {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  progress: number;
}

export default function CompanyEditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      const projectData = data.project || data;
      setProject(projectData);

      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        startDate: projectData.startDate
          ? new Date(projectData.startDate).toISOString().split('T')[0]
          : projectData.start_date
            ? new Date(projectData.start_date).toISOString().split('T')[0]
            : '',
        endDate: projectData.endDate
          ? new Date(projectData.endDate).toISOString().split('T')[0]
          : projectData.end_date
            ? new Date(projectData.end_date).toISOString().split('T')[0]
            : '',
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Proje yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      toast.success('Proje başarıyla güncellendi!');
      router.push(`/company-dashboard/projects/${projectId}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Proje yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Proje bulunamadı</p>
          <Link href="/company-dashboard/projects">
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    planning: 'Planlama',
    active: 'Aktif',
    on_hold: 'Beklemede',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    todo: 'Yapılacak',
    in_progress: 'Devam Ediyor',
    review: 'İncelemede',
    done: 'Tamamlandı',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    urgent: 'Acil',
    critical: 'Kritik',
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <GradientHeader
          icon={Briefcase}
          title="Proje Düzenle"
          subtitle={project.name}
          progress={project.progress}
          actions={
            <Link href={`/company-dashboard/projects/${projectId}`}>
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
                Proje Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: E-İhracat Dönüşüm Projesi"
                required
                disabled={saving}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Proje hakkında detaylı açıklama..."
                rows={4}
                disabled={saving}
              />
            </div>

            {/* Status & Priority - Readonly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Input
                  id="status"
                  value={statusLabels[project.status] || project.status}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Input
                  id="priority"
                  value={priorityLabels[project.priority] || project.priority}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Progress Info */}
            <EnhancedCard className="bg-blue-50/50 border-blue-200 p-4">
              <p className="text-sm text-blue-700">
                <strong>İlerleme:</strong> {project.progress}% (Otomatik hesaplanır)
              </p>
            </EnhancedCard>

            {/* Info Message */}
            <EnhancedCard className="bg-yellow-50/50 border-yellow-200 p-4">
              <p className="text-sm text-yellow-700">
                <strong>Not:</strong> Durum ve öncelik bilgileri sadece danışmanınız tarafından
                değiştirilebilir.
              </p>
            </EnhancedCard>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={saving || !formData.name} className="flex-1">
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
                onClick={() => router.push(`/company-dashboard/projects/${projectId}`)}
                disabled={saving}
              >
                İptal
              </Button>
            </div>
          </form>
        </EnhancedCard>
      </div>
    </div>
  );
}
