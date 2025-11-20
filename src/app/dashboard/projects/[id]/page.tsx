'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  Briefcase,
  Gauge,
  Layers,
  Loader2,
  Plus,
  Table,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { ProjectHierarchyAccordion } from '@/presentation/components/features/projects/ProjectHierarchyAccordion';
import { ProjectAssignmentMatrix } from '@/presentation/components/features/projects/ProjectAssignmentMatrix';
import {
  ProjectHierarchyDTO,
  SubProjectWithTasksDTO,
  TaskDTO,
} from '@/application/dto/project-hierarchy.dto';
import { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';
import { SubProjectModal } from '@/presentation/components/features/sub-projects/SubProjectModal';
import { TaskModal } from '@/presentation/components/features/tasks/TaskModal';
import { toast } from 'sonner';
import { ProjectDetailHeader } from './components/ProjectDetailHeader';
import { BulkAssignmentDialog } from '@/presentation/components/features/projects/BulkAssignmentDialog';
import { BulkDatesDialog } from '@/presentation/components/features/projects/BulkDatesDialog';

type TabValue = 'overview' | 'structure' | 'assignments';

type EditableSubProject = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  progress: number;
  order_index: number;
};

const STATUS_BADGES: Record<string, { label: string; badgeClass: string }> = {
  planning: {
    label: 'Planlama',
    badgeClass:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  },
  active: {
    label: 'Aktif',
    badgeClass:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  },
  in_progress: {
    label: 'Devam Ediyor',
    badgeClass:
      'bg-primary/10 text-primary border-primary/40 dark:text-primary dark:border-primary/50',
  },
  on_hold: {
    label: 'Beklemede',
    badgeClass:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  },
  review: {
    label: 'İncelemede',
    badgeClass:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  },
  done: {
    label: 'Tamamlandı',
    badgeClass:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  },
  completed: {
    label: 'Tamamlandı',
    badgeClass:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  },
  cancelled: {
    label: 'İptal',
    badgeClass:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700',
  },
};

const PRIORITY_BADGES: Record<string, { label: string; badgeClass: string }> = {
  low: {
    label: 'Düşük',
    badgeClass:
      'bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  },
  medium: {
    label: 'Orta',
    badgeClass:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  },
  high: {
    label: 'Yüksek',
    badgeClass:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  },
  urgent: {
    label: 'Acil',
    badgeClass:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700',
  },
  critical: {
    label: 'Kritik',
    badgeClass:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700',
  },
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  // Redirect to new page if id is "new"
  useEffect(() => {
    if (projectId === 'new') {
      router.replace('/dashboard/projects/new');
      return;
    }
  }, [projectId, router]);

  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [hierarchy, setHierarchy] = useState<ProjectHierarchyDTO | null>(null);
  const [hierarchyLoading, setHierarchyLoading] = useState(true);
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);

  const [matrix, setMatrix] = useState<ProjectAssignmentMatrixDTO | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixError, setMatrixError] = useState<string | null>(null);

  const [subProjectModalOpen, setSubProjectModalOpen] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState<EditableSubProject | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalSubProjectId, setTaskModalSubProjectId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [bulkAssignmentOpen, setBulkAssignmentOpen] = useState(false);
  const [bulkAssignmentSubmitting, setBulkAssignmentSubmitting] = useState(false);
  const [bulkDatesOpen, setBulkDatesOpen] = useState(false);
  const [bulkDatesSubmitting, setBulkDatesSubmitting] = useState(false);

  const fetchHierarchy = useCallback(async () => {
    // Don't fetch if id is "new"
    if (projectId === 'new') {
      return;
    }

    setHierarchyLoading(true);
    setHierarchyError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/hierarchy`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Proje yapısı getirilemedi');
      }

      const payload = await response.json();
      const data: ProjectHierarchyDTO | undefined = payload?.data ?? payload;

      if (!data) {
        throw new Error('Proje yapısı bulunamadı');
      }

      setHierarchy(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
      setHierarchyError(message);
    } finally {
      setHierarchyLoading(false);
    }
  }, [projectId]);

  const fetchAssignmentMatrix = useCallback(async () => {
    setMatrixLoading(true);
    setMatrixError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/assignment-matrix`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Atama matrisi getirilemedi');
      }

      const payload = await response.json();
      const data: ProjectAssignmentMatrixDTO | undefined = payload?.data ?? payload;

      setMatrix(data ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
      setMatrixError(message);
    } finally {
      setMatrixLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  useEffect(() => {
    if (activeTab === 'assignments' && !matrix && !matrixLoading && !matrixError) {
      fetchAssignmentMatrix();
    }
  }, [activeTab, fetchAssignmentMatrix, matrix, matrixLoading, matrixError]);

  const project = hierarchy?.project;
  const stats = hierarchy?.stats;
  const subProjects = useMemo<SubProjectWithTasksDTO[]>(
    () => hierarchy?.subProjects ?? [],
    [hierarchy]
  );
  const totalSubProjects = stats?.totalSubProjects ?? subProjects.length;
  const totalTasks =
    stats?.totalTasks ??
    subProjects.reduce(
      (accumulator, subProject) => accumulator + (subProject.tasks?.length ?? 0),
      0
    );
  const completedTasks = stats?.completedTasks ?? 0;

  const allTasks = useMemo<TaskDTO[]>(() => {
    return subProjects.flatMap((subProject) => subProject.tasks ?? []);
  }, [subProjects]);

  const mapSubProjectForModal = useCallback(
    (subProject: SubProjectWithTasksDTO): EditableSubProject => ({
      id: subProject.id,
      name: subProject.name,
      description: subProject.description ?? '',
      status: subProject.status ?? 'todo',
      progress: subProject.progress ?? 0,
      order_index: subProject.orderIndex ?? 0,
    }),
    []
  );

  const handleCreateSubProject = useCallback(() => {
    setEditingSubProject(null);
    setSubProjectModalOpen(true);
  }, []);

  const handleEditSubProject = useCallback(
    (subProject: SubProjectWithTasksDTO) => {
      setEditingSubProject(mapSubProjectForModal(subProject));
      setSubProjectModalOpen(true);
    },
    [mapSubProjectForModal]
  );

  const handleDeleteSubProject = useCallback(
    async (subProjectId: string) => {
      const confirmed = window.confirm('Alt projeyi silmek istediğinizden emin misiniz?');
      if (!confirmed) {
        return;
      }

      try {
        const response = await fetch(`/api/sub-projects/${subProjectId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || 'Alt proje silinemedi.');
        }

        toast.success('Alt proje silindi.');
        await fetchHierarchy();
      } catch (error) {
        console.error('Error deleting sub-project:', error);
        toast.error(error instanceof Error ? error.message : 'Alt proje silinemedi.');
      }
    },
    [fetchHierarchy]
  );

  const handleMoveSubProject = useCallback(
    async (subProjectId: string, direction: 'up' | 'down') => {
      const ordered = [...subProjects].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      const currentIndex = ordered.findIndex((subProject) => subProject.id === subProjectId);
      if (currentIndex === -1) {
        return;
      }
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= ordered.length) {
        return;
      }

      const current = ordered[currentIndex];
      const target = ordered[targetIndex];

      try {
        const [currentResponse, targetResponse] = await Promise.all([
          fetch(`/api/sub-projects/${current.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIndex: target.orderIndex ?? 0 }),
          }),
          fetch(`/api/sub-projects/${target.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIndex: current.orderIndex ?? 0 }),
          }),
        ]);

        if (!currentResponse.ok || !targetResponse.ok) {
          const currentError = await currentResponse.json().catch(() => ({}));
          const targetError = await targetResponse.json().catch(() => ({}));
          throw new Error(
            currentError?.error || targetError?.error || 'Alt proje sırası güncellenemedi.'
          );
        }

        toast.success('Alt proje sırası güncellendi.');
        await fetchHierarchy();
      } catch (error) {
        console.error('Error updating sub-project order:', error);
        toast.error(error instanceof Error ? error.message : 'Alt proje sırası güncellenemedi.');
      }
    },
    [subProjects, fetchHierarchy]
  );

  const handleCreateTask = useCallback((subProjectId: string) => {
    setEditingTask(null);
    setTaskModalSubProjectId(subProjectId);
    setTaskModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: TaskDTO) => {
    setEditingTask({
      ...task,
      orderIndex: task.orderIndex ?? 0,
    });
    setTaskModalSubProjectId(task.subProjectId);
    setTaskModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      const confirmed = window.confirm('Görevi silmek istediğinizden emin misiniz?');
      if (!confirmed) {
        return;
      }

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || 'Görev silinemedi.');
        }

        toast.success('Görev silindi.');
        await fetchHierarchy();
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error(error instanceof Error ? error.message : 'Görev silinemedi.');
      }
    },
    [fetchHierarchy]
  );

  const handleMoveTask = useCallback(
    async (taskId: string, direction: 'up' | 'down') => {
      const currentTask = allTasks.find((task) => task.id === taskId);
      if (!currentTask) {
        return;
      }

      const tasksInSubProject = allTasks
        .filter((task) => task.subProjectId === currentTask.subProjectId)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

      const currentIndex = tasksInSubProject.findIndex((task) => task.id === taskId);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= tasksInSubProject.length) {
        return;
      }

      const targetTask = tasksInSubProject[targetIndex];

      try {
        const [currentResponse, targetResponse] = await Promise.all([
          fetch(`/api/tasks/${currentTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIndex: targetTask.orderIndex ?? 0 }),
          }),
          fetch(`/api/tasks/${targetTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIndex: currentTask.orderIndex ?? 0 }),
          }),
        ]);

        if (!currentResponse.ok || !targetResponse.ok) {
          const currentError = await currentResponse.json().catch(() => ({}));
          const targetError = await targetResponse.json().catch(() => ({}));
          throw new Error(
            currentError?.error || targetError?.error || 'Görev sırası güncellenemedi.'
          );
        }

        toast.success('Görev sırası güncellendi.');
        await fetchHierarchy();
      } catch (error) {
        console.error('Error updating task order:', error);
        toast.error(error instanceof Error ? error.message : 'Görev sırası güncellenemedi.');
      }
    },
    [allTasks, fetchHierarchy]
  );

  const handleViewSubProject = useCallback((subProject: SubProjectWithTasksDTO) => {
    toast.info(`Alt proje detay ekranı yakında: ${subProject.name}`);
  }, []);

  const handleViewTask = useCallback((task: TaskDTO) => {
    toast.info(`Görev detay ekranı yakında: ${task.title}`);
  }, []);

  const hasMatrixData =
    Boolean(matrix) && matrix!.companies.length > 0 && matrix!.subProjects.length > 0;

  const handleOpenBulkAssignment = useCallback(() => {
    if (!matrix) {
      if (!matrixLoading) {
        fetchAssignmentMatrix();
      }
      setBulkAssignmentOpen(true);
      return;
    }

    if (matrix.companies.length === 0 || matrix.subProjects.length === 0) {
      toast.info('Atama yapılacak firma veya alt proje bulunmuyor.');
      return;
    }

    setBulkAssignmentOpen(true);
  }, [fetchAssignmentMatrix, matrix, matrixLoading]);

  const handleOpenBulkDates = useCallback(() => {
    if (!matrix) {
      if (!matrixLoading) {
        fetchAssignmentMatrix();
      }
      setBulkDatesOpen(true);
      return;
    }

    if (matrix.companies.length === 0 || matrix.subProjects.length === 0) {
      toast.info('Tarih düzenleyebileceğiniz firma veya alt proje bulunmuyor.');
      return;
    }

    setBulkDatesOpen(true);
  }, [fetchAssignmentMatrix, matrix, matrixLoading]);

  const handleBulkAssignmentSubmit = useCallback(
    async (assignments: Array<{ companyId: string; subProjectIds: string[] }>) => {
      try {
        setBulkAssignmentSubmitting(true);
        const response = await fetch(`/api/projects/${projectId}/assignments/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignments }),
        });
        const payload = await response.json().catch(() => ({}));

        const errorItems: Array<{
          companyId?: string;
          subProjectId?: string | null;
          error?: string;
          message?: string;
        }> = Array.isArray(payload?.errors)
          ? payload.errors
          : Array.isArray(payload?.details)
            ? payload.details
            : [];

        if (!response.ok) {
          const errorMessage = payload?.error || 'Alt proje atamaları güncellenemedi.';
          if (errorItems.length > 0) {
            const detail = errorItems
              .map((item) => {
                const targetFirma = item.companyId ?? 'Firma';
                const subProjectLabel = item.subProjectId
                  ? ` · Alt Proje ${item.subProjectId}`
                  : '';
                return `${targetFirma}${subProjectLabel}: ${
                  item.error ?? item.message ?? 'Bilinmeyen hata'
                }`;
              })
              .join('\n');
            toast.error(errorMessage, { description: detail });
          } else {
            toast.error(errorMessage);
          }
          return;
        }

        const successCount = payload?.successCount ?? 0;
        const removeCount = payload?.removeCount ?? 0;

        toast.success('Alt proje atamaları güncellendi.', {
          description: `Yeni atama: ${successCount} · Kaldırılan: ${removeCount}`,
        });

        if (errorItems.length > 0) {
          const detail = errorItems
            .map((item) => {
              const targetFirma = item.companyId ?? 'Firma';
              const subProjectLabel = item.subProjectId ? ` · Alt Proje ${item.subProjectId}` : '';
              return `${targetFirma}${subProjectLabel}: ${
                item.message ?? item.error ?? 'Bilinmeyen uyarı'
              }`;
            })
            .join('\n');
          toast.warning('Bazı işlemler tamamlanamadı', {
            description: detail,
          });
        }
        setBulkAssignmentOpen(false);
        await fetchAssignmentMatrix();
      } catch (error) {
        console.error('Bulk assignment error:', error);
        toast.error(error instanceof Error ? error.message : 'Alt proje atamaları güncellenemedi.');
      } finally {
        setBulkAssignmentSubmitting(false);
      }
    },
    [projectId, fetchAssignmentMatrix]
  );

  const handleBulkDatesSubmit = useCallback(
    async (
      subProjectId: string,
      dates: Array<{ companyId: string; startDate: string | null; endDate: string | null }>
    ) => {
      try {
        setBulkDatesSubmitting(true);
        const response = await fetch(
          `/api/projects/${projectId}/sub-projects/${subProjectId}/dates/bulk`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dates }),
          }
        );
        const payload = await response.json().catch(() => ({}));

        const errorItems: Array<{ companyId?: string; error?: string; message?: string }> =
          Array.isArray(payload?.errors)
            ? payload.errors
            : Array.isArray(payload?.details)
              ? payload.details
              : [];

        if (!response.ok) {
          const errorMessage = payload?.error || 'Tarih güncellemeleri kaydedilemedi.';
          if (errorItems.length > 0) {
            const detail = errorItems
              .map(
                (item) =>
                  `${item.companyId ?? 'Firma'}: ${item.error ?? item.message ?? 'Bilinmeyen hata'}`
              )
              .join('\n');
            toast.error(errorMessage, { description: detail });
          } else {
            toast.error(errorMessage);
          }
          return;
        }

        const updatedCount = payload?.updatedCount ?? 0;
        toast.success('Tarih güncellemeleri kaydedildi.', {
          description: `${updatedCount} kayıt güncellendi.`,
        });

        if (errorItems.length > 0) {
          const detail = errorItems
            .map(
              (item) =>
                `${item.companyId ?? 'Firma'}: ${item.message ?? item.error ?? 'Bilinmeyen uyarı'}`
            )
            .join('\n');
          toast.warning('Bazı firmalarda tarih güncellenemedi', {
            description: detail,
          });
        }
        setBulkDatesOpen(false);
        await fetchAssignmentMatrix();
      } catch (error) {
        console.error('Bulk date assignment error:', error);
        toast.error(error instanceof Error ? error.message : 'Tarih güncellemeleri kaydedilemedi.');
      } finally {
        setBulkDatesSubmitting(false);
      }
    },
    [projectId, fetchAssignmentMatrix]
  );

  const statusBadge = project
    ? (STATUS_BADGES[project.status] ?? {
        label: project.status,
        badgeClass:
          'bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      })
    : null;

  const priorityBadge = project
    ? (PRIORITY_BADGES[project.priority] ?? {
        label: project.priority,
        badgeClass:
          'bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      })
    : null;

  const progressValue = project?.progress ?? stats?.overallProgress ?? 0;

  const startDateLabel = formatDate(project?.startDate);
  const endDateLabel = formatDate(project?.endDate);

  const overviewCards = useMemo(
    () => [
      {
        title: 'Genel İlerleme',
        value: `${progressValue}%`,
        description: 'Ana projenin tamamlanma oranı',
        icon: TrendingUp,
      },
      {
        title: 'Alt Proje',
        value: totalSubProjects,
        description: 'Toplam alt proje sayısı',
        icon: Layers,
      },
      {
        title: 'Görev',
        value: totalTasks,
        description: 'Toplam görev adedi',
        icon: Briefcase,
      },
      {
        title: 'Tamamlanan Görev',
        value: completedTasks,
        description: 'Tamamlanan görev sayısı',
        icon: Gauge,
      },
    ],
    [progressValue, totalSubProjects, totalTasks, completedTasks]
  );

  if (hierarchyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Proje detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (hierarchyError || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 rounded-2xl border border-destructive/30 bg-white dark:bg-gray-900/80 p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Activity className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Proje yüklenemedi</h1>
            <p className="text-sm text-muted-foreground">
              {hierarchyError || 'Proje bilgilerine ulaşılamadı. Lütfen tekrar deneyin.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={fetchHierarchy}>
              Yeniden Dene
            </Button>
            <Button onClick={() => router.push('/dashboard/projects')}>Projeler listesi</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 border border-border/60 bg-background hover:bg-muted"
            onClick={() => router.push('/dashboard/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <ProjectDetailHeader
              name={project.name}
              statusLabel={statusBadge?.label ?? project.status}
              statusColorClass={statusBadge?.badgeClass ?? ''}
              priorityLabel={priorityBadge?.label ?? null}
              priorityColorClass={priorityBadge?.badgeClass ?? null}
              companyName={project.companyName ?? null}
              consultantName={project.consultantName ?? null}
              startDate={startDateLabel}
              endDate={endDateLabel}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map(({ title, value, description, icon: Icon }) => (
            <Card
              key={title}
              className="border border-border/70 bg-white/90 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/80"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {title}
                  </p>
                  <p className="text-xl font-semibold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-border/70 bg-white/95 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/80">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
            <div className="border-b border-border/70 bg-muted/30">
              <TabsList className="h-auto gap-1 rounded-none border-none bg-transparent p-2">
                <TabsTrigger value="overview" className="gap-2 rounded-lg px-4 py-2">
                  <Briefcase className="h-4 w-4" />
                  Genel Bakış
                </TabsTrigger>
                <TabsTrigger value="structure" className="gap-2 rounded-lg px-4 py-2">
                  <Layers className="h-4 w-4" />
                  Proje Yapısı
                </TabsTrigger>
                <TabsTrigger value="assignments" className="gap-2 rounded-lg px-4 py-2">
                  <Table className="h-4 w-4" />
                  Atamalar
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border border-border/60 bg-background/80 shadow-none dark:bg-gray-950/40">
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-foreground">Proje Özeti</h2>
                      <p className="text-sm text-muted-foreground">
                        Projenin temel bilgilerinin kısa özeti
                      </p>
                    </div>
                    {project.description ? (
                      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                        {project.description}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                        Açıklama eklenmemiş.
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <Badge className={statusBadge?.badgeClass}>{statusBadge?.label}</Badge>
                      {priorityBadge ? (
                        <Badge className={priorityBadge.badgeClass}>{priorityBadge.label}</Badge>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/60 bg-background/80 shadow-none dark:bg-gray-950/40">
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-foreground">Zaman Çizelgesi</h2>
                      <p className="text-sm text-muted-foreground">
                        Projenin başlangıç ve bitiş tarihleri
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Başlangıç</p>
                        <p className="text-base font-medium text-foreground">
                          {startDateLabel ?? 'Belirsiz'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Bitiş</p>
                        <p className="text-base font-medium text-foreground">
                          {endDateLabel ?? 'Belirsiz'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-2">İlerleme</p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(Math.max(progressValue, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="structure" className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Proje Yapısı</h2>
                  <p className="text-sm text-muted-foreground">
                    {totalSubProjects} alt proje · {totalTasks} görev
                  </p>
                </div>
                <Button size="sm" onClick={handleCreateSubProject}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Alt Proje
                </Button>
              </div>

              <ProjectHierarchyAccordion
                projectId={project.id}
                subProjects={subProjects}
                mode="admin"
                editable
                reorderable
                onSubProjectView={handleViewSubProject}
                onSubProjectEdit={handleEditSubProject}
                onSubProjectDelete={handleDeleteSubProject}
                onSubProjectMoveUp={(id) => handleMoveSubProject(id, 'up')}
                onSubProjectMoveDown={(id) => handleMoveSubProject(id, 'down')}
                onTaskCreate={handleCreateTask}
                onTaskEdit={handleEditTask}
                onTaskDelete={handleDeleteTask}
                onTaskMoveUp={(taskId) => handleMoveTask(taskId, 'up')}
                onTaskMoveDown={(taskId) => handleMoveTask(taskId, 'down')}
                onTaskView={handleViewTask}
              />
            </TabsContent>

            <TabsContent value="assignments" className="p-6">
              <ProjectAssignmentMatrix
                matrix={matrix}
                loading={matrixLoading}
                error={matrixError}
                onRefresh={fetchAssignmentMatrix}
                onBulkAssign={handleOpenBulkAssignment}
                onBulkDates={handleOpenBulkDates}
                actionsDisabled={
                  matrixLoading || bulkAssignmentSubmitting || bulkDatesSubmitting || !hasMatrixData
                }
              />
            </TabsContent>
          </Tabs>
        </Card>

        {project && (
          <SubProjectModal
            projectId={project.id}
            subProject={
              editingSubProject
                ? ({
                    id: editingSubProject.id,
                    name: editingSubProject.name,
                    description: editingSubProject.description ?? undefined,
                    status: editingSubProject.status,
                    progress: editingSubProject.progress,
                    order_index: editingSubProject.order_index,
                  } as any)
                : null
            }
            open={subProjectModalOpen}
            onOpenChange={(open) => {
              setSubProjectModalOpen(open);
              if (!open) {
                setEditingSubProject(null);
              }
            }}
            onSuccess={() => fetchHierarchy()}
          />
        )}

        {project && taskModalOpen && taskModalSubProjectId && (
          <TaskModal
            subProjectId={taskModalSubProjectId}
            task={
              editingTask
                ? {
                    ...editingTask,
                    orderIndex: editingTask.orderIndex ?? 0,
                  }
                : undefined
            }
            open={taskModalOpen}
            onOpenChange={(open) => {
              setTaskModalOpen(open);
              if (!open) {
                setEditingTask(null);
                setTaskModalSubProjectId(null);
              }
            }}
            onSuccess={() => fetchHierarchy()}
          />
        )}

        <BulkAssignmentDialog
          open={bulkAssignmentOpen}
          onOpenChange={(open) => {
            if (!open && bulkAssignmentSubmitting) {
              return;
            }
            setBulkAssignmentOpen(open);
          }}
          matrix={matrix}
          onSubmit={handleBulkAssignmentSubmit}
          submitting={bulkAssignmentSubmitting}
        />

        <BulkDatesDialog
          open={bulkDatesOpen}
          onOpenChange={(open) => {
            if (!open && bulkDatesSubmitting) {
              return;
            }
            setBulkDatesOpen(open);
          }}
          matrix={matrix}
          onSubmit={handleBulkDatesSubmit}
          submitting={bulkDatesSubmitting}
        />
      </div>
    </div>
  );
}
