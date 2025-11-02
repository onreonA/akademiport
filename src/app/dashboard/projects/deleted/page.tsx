'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, RotateCcw, ArrowLeft, Calendar } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { toast } from 'sonner';

interface DeletedProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  companyName?: string;
  consultantName?: string;
  deletedAt: string;
  createdAt: string;
}

export default function DeletedProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<DeletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeletedProjects();
  }, []);

  const fetchDeletedProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects/deleted');
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Silinen projeleri görüntüleme yetkiniz yok.');
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch deleted projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching deleted projects:', error);
      toast.error('Silinen projeler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (projectId: string) => {
    if (!confirm('Bu projeyi geri yüklemek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setRestoringId(projectId);
      const response = await fetch(`/api/projects/${projectId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore project');
      }

      toast.success('Proje başarıyla geri yüklendi.');

      // Remove from list
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Error restoring project:', error);
      toast.error(
        error instanceof Error ? error.message : 'Proje geri yüklenirken bir hata oluştu.'
      );
    } finally {
      setRestoringId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      review: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      done: 'bg-green-500/10 text-green-500 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      todo: 'Yapılacak',
      in_progress: 'Devam Ediyor',
      review: 'İncelemede',
      done: 'Tamamlandı',
      cancelled: 'İptal',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>
          <GradientHeader
            title="Silinen Projeler"
            description="Silinmiş projeleri görüntüleyin ve geri yükleyin"
            icon={Trash2}
          />
        </div>
      </div>

      {projects.length === 0 ? (
        <EnhancedCard variant="glass" className="p-12 text-center">
          <Trash2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Silinen Proje Yok</h3>
          <p className="text-muted-foreground">Henüz silinen proje bulunmuyor.</p>
        </EnhancedCard>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <EnhancedCard key={project.id} variant="glass" className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Silinme Tarihi: {formatDate(project.deletedAt)}</span>
                    </div>
                    {project.companyName && <span>Firma: {project.companyName}</span>}
                    {project.consultantName && <span>Danışman: {project.consultantName}</span>}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">İlerleme</span>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(project.id)}
                    disabled={restoringId === project.id}
                    className="gap-2"
                  >
                    <RotateCcw
                      className={`h-4 w-4 ${restoringId === project.id ? 'animate-spin' : ''}`}
                    />
                    {restoringId === project.id ? 'Geri Yükleniyor...' : 'Geri Yükle'}
                  </Button>
                </div>
              </div>
            </EnhancedCard>
          ))}
        </div>
      )}
    </div>
  );
}
