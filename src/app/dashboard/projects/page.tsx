'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCircle, FolderKanban, Plus, Search } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';
import { ProjectCard } from '@/presentation/components/features/projects/ProjectCard';

type ProjectListItem = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority: string;
  progress: number;
  companyName?: string | null;
  consultantName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  createdAt: string;
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'planning', label: 'Planlama' },
  { value: 'active', label: 'Aktif' },
  { value: 'in_progress', label: 'Devam Ediyor' },
  { value: 'on_hold', label: 'Beklemede' },
  { value: 'review', label: 'İncelemede' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'done', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
];

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/projects?${params.toString()}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Projeler alınırken bir sorun oluştu.');
      }

      const payload = await response.json();
      const raw =
        Array.isArray(payload) && payload.length > 0
          ? payload
          : (payload?.data?.projects ?? payload?.projects ?? payload?.data ?? []);

      const list = Array.isArray(raw) ? raw : (raw?.data ?? []);

      const normalized: ProjectListItem[] = list.map((project: any) => {
        const startDate = project.startDate ?? project.start_date ?? null;
        const endDate = project.endDate ?? project.end_date ?? null;

        return {
          id: project.id,
          name: project.name,
          description: project.description ?? null,
          status: project.status ?? 'todo',
          priority: project.priority ?? 'medium',
          progress: project.progress ?? 0,
          companyName: project.companyName ?? project.company_name ?? null,
          consultantName: project.consultantName ?? project.consultant_name ?? null,
          startDate,
          endDate,
          start_date: startDate,
          end_date: endDate,
          createdAt: project.createdAt ?? project.created_at ?? new Date().toISOString(),
        };
      });

      setProjects(normalized);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Projeler yüklenemedi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return projects;
    }

    return projects.filter((project) => {
      const haystack = [project.name, project.companyName ?? '', project.consultantName ?? '']
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [projects, searchTerm]);

  const handleDelete = useCallback(
    async (project: ProjectListItem) => {
      if (deletingId) {
        return;
      }

      const confirmed = window.confirm(
        `"${project.name}" projesini silmek istediğinizden emin misiniz?`
      );
      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(project.id);
        const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || 'Proje silinemedi');
        }

        toast.success('Proje başarıyla silindi.');
        fetchProjects();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Proje silinirken bir hata oluştu.';
        toast.error(message);
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, fetchProjects]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-foreground">Projeler</h1>
            <p className="text-sm text-muted-foreground">
              Tüm projeleri görüntüleyin, filtreleyin ve yönetin.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/projects/deleted')}
            >
              Silinen Projeler
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Proje
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border border-border/60 bg-background/95 shadow-sm dark:bg-gray-900/80">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Proje adı, firma veya danışman ara..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border border-destructive/40 bg-destructive/5 text-destructive">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Projeler yüklenemedi</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="border border-border/60 bg-background/95 shadow-sm dark:bg-gray-900/80"
              >
                <CardContent className="flex flex-col gap-4 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border border-border/60 bg-background/90 shadow-sm dark:bg-gray-900/80">
            <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FolderKanban className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Proje bulunamadı</h2>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? 'Arama kriterlerinize uygun proje bulunamadı.'
                    : 'Henüz proje bulunmuyor. İlk projenizi oluşturarak başlayabilirsiniz.'}
                </p>
              </div>
              {!searchTerm && (
                <Button variant="outline" asChild>
                  <Link href="/dashboard/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    İlk projeyi oluştur
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project as any}
                onDelete={() => handleDelete(project)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
