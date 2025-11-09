'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';

type DeletedProject = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority: string;
  progress: number;
  companyName?: string | null;
  consultantName?: string | null;
  deletedAt: string;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  todo: 'bg-muted text-foreground border-transparent',
  in_progress:
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  review:
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  done: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  completed:
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  cancelled:
    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'Yapılacak',
  in_progress: 'Devam Ediyor',
  review: 'İncelemede',
  done: 'Tamamlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function DeletedProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<DeletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchDeletedProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/deleted');
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Silinen projeleri görüntüleme yetkiniz yok.');
          router.push('/dashboard');
          return;
        }

        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Silinen projeler yüklenemedi.');
      }

      const payload = await response.json();
      const raw = payload?.projects ?? payload?.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw?.data ?? []);

      setProjects(
        list.map((project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description ?? null,
          status: project.status ?? 'todo',
          priority: project.priority ?? 'medium',
          progress: project.progress ?? 0,
          companyName: project.companyName ?? project.company_name ?? null,
          consultantName: project.consultantName ?? project.consultant_name ?? null,
          deletedAt:
            project.deletedAt ?? project.deleted_at ?? project.updatedAt ?? project.updated_at,
          createdAt: project.createdAt ?? project.created_at ?? new Date().toISOString(),
        }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Silinen projeler yüklenemedi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDeletedProjects();
  }, [fetchDeletedProjects]);

  const handleRestore = useCallback(
    async (projectId: string) => {
      if (restoringId) {
        return;
      }

      const confirmed = window.confirm('Bu projeyi geri yüklemek istediğinizden emin misiniz?');
      if (!confirmed) {
        return;
      }

      try {
        setRestoringId(projectId);
        const response = await fetch(`/api/projects/${projectId}/restore`, { method: 'POST' });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || 'Proje geri yüklenemedi.');
        }

        toast.success('Proje başarıyla geri yüklendi.');
        setProjects((prev) => prev.filter((project) => project.id !== projectId));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Proje geri yüklenirken bir hata oluştu.';
        toast.error(message);
      } finally {
        setRestoringId(null);
      }
    },
    [restoringId]
  );

  const emptyState = useMemo(
    () => projects.length === 0 && !loading && !error,
    [projects.length, loading, error]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Silinen Projeler</h1>
              <p className="text-sm text-muted-foreground">
                Silinmiş projeleri inceleyin ve gerekirse geri yükleyin.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <Card className="border border-destructive/40 bg-destructive/5 text-destructive">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold">Silinen projeler yüklenemedi</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
              <Button size="sm" variant="outline" onClick={fetchDeletedProjects}>
                Yeniden Dene
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card
                key={index}
                className="border border-border/60 bg-background/95 shadow-sm dark:bg-gray-900/80"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/5" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {emptyState ? (
          <Card className="border border-border/60 bg-background/95 shadow-sm dark:bg-gray-900/80">
            <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Trash2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Silinen proje yok</h2>
                <p className="text-sm text-muted-foreground">
                  Henüz silinen proje bulunmuyor. Bir proje sildiğinizde burada listelenecek.
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push('/dashboard/projects')}>
                Proje listesine dön
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!loading && !emptyState ? (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const badgeClass =
                STATUS_STYLES[project.status] ??
                'bg-muted text-muted-foreground border-transparent';

              return (
                <Card
                  key={project.id}
                  className="border border-border/60 bg-background/95 shadow-sm dark:bg-gray-900/80"
                >
                  <CardContent className="flex flex-col gap-5 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                          <Badge className={badgeClass}>
                            {STATUS_LABELS[project.status] ?? project.status}
                          </Badge>
                        </div>
                        {project.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(project.id)}
                        disabled={restoringId === project.id}
                        className="gap-2"
                      >
                        <RotateCcw
                          className={`h-4 w-4 ${
                            restoringId === project.id ? 'animate-spin text-primary' : ''
                          }`}
                        />
                        {restoringId === project.id ? 'Geri Yükleniyor...' : 'Geri Yükle'}
                      </Button>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Silinme Tarihi:{' '}
                          <span className="font-medium text-foreground">
                            {formatDateTime(project.deletedAt)}
                          </span>
                        </span>
                      </div>
                      {project.companyName ? (
                        <span>
                          Firma:{' '}
                          <span className="font-medium text-foreground">{project.companyName}</span>
                        </span>
                      ) : null}
                      {project.consultantName ? (
                        <span>
                          Danışman:{' '}
                          <span className="font-medium text-foreground">
                            {project.consultantName}
                          </span>
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>İlerleme</span>
                        <span className="font-medium text-foreground">{project.progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
