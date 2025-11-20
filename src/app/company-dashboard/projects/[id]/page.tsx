'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Layers,
  ListTodo,
  MessageCircle,
  TrendingUp,
  User,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { ProjectHierarchyAccordion } from '@/presentation/components/features/projects/ProjectHierarchyAccordion';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  ProjectHierarchyDTO,
  SubProjectWithTasksDTO,
  TaskDTO,
} from '@/application/dto/project-hierarchy.dto';
import { postTaskComment } from '@/presentation/utils/taskActions';

interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  consultantName?: string;
  consultantEmail?: string;
}

const statusLabels: Record<string, { label: string; badge: string }> = {
  planning: {
    label: 'Planlama',
    badge:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  active: {
    label: 'Aktif',
    badge:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  },
  on_hold: {
    label: 'Beklemede',
    badge:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  completed: {
    label: 'Tamamlandı',
    badge:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  },
  cancelled: {
    label: 'İptal',
    badge:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800',
  },
  todo: {
    label: 'Yapılacak',
    badge:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  },
  in_progress: {
    label: 'Devam Ediyor',
    badge:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  review: {
    label: 'İncelemede',
    badge:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  done: {
    label: 'Tamamlandı',
    badge:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 border-green-200 dark:border-green-800',
  },
};

const priorityLabels: Record<string, { label: string; badge: string }> = {
  low: {
    label: 'Düşük',
    badge:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  },
  medium: {
    label: 'Orta',
    badge:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  high: {
    label: 'Yüksek',
    badge:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  urgent: {
    label: 'Acil',
    badge:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800',
  },
};

export default function CompanyProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [hierarchy, setHierarchy] = useState<ProjectHierarchyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeNote, setCompleteNote] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch project' }));
        throw new Error(errorData.error || 'Failed to fetch project');
      }
      const data = await response.json();
      const projectData = data.project || data;

      const normalizedProject: ProjectSummary = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'active',
        priority: projectData.priority || 'medium',
        progress: projectData.progress ?? 0,
        startDate: projectData.startDate || projectData.start_date,
        endDate: projectData.endDate || projectData.end_date,
        consultantName: projectData.consultant?.full_name || projectData.consultantName,
        consultantEmail: projectData.consultant?.email,
      };

      setProject(normalizedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchHierarchy = useCallback(async () => {
    try {
      setHierarchyLoading(true);
      const response = await fetch(`/api/projects/${projectId}/hierarchy`);
      if (!response.ok) throw new Error('Proje yapısı getirilemedi');
      const data = await response.json();
      setHierarchy(data.data || null);
    } catch (err) {
      console.error('Error fetching hierarchy:', err);
      toast.error('Proje yapısı yüklenemedi');
    } finally {
      setHierarchyLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    fetchHierarchy();
  }, [fetchProject, fetchHierarchy]);

  const subProjects: SubProjectWithTasksDTO[] = useMemo(
    () => hierarchy?.subProjects || [],
    [hierarchy]
  );
  const allTasks = useMemo(() => subProjects.flatMap((sp) => sp.tasks || []), [subProjects]);
  const taskStats = useMemo(() => {
    const totals = {
      total: allTasks.length,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
    };

    allTasks.forEach((task) => {
      if (task.status === 'todo') totals.todo += 1;
      if (task.status === 'in_progress') totals.inProgress += 1;
      if (task.status === 'review') totals.review += 1;
      if (task.status === 'done') totals.done += 1;
    });

    return totals;
  }, [allTasks]);

  const formatDate = (date?: string) => {
    if (!date) return 'Belirtilmedi';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const applyTaskStatusLocally = (taskId: string, status: string) => {
    let updatedStatsSnapshot: ProjectHierarchyDTO['stats'] | null = null;

    setHierarchy((prev) => {
      if (!prev) return prev;

      const taskExists = prev.subProjects.some((subProject) =>
        (subProject.tasks || []).some((task) => task.id === taskId)
      );

      if (!taskExists) {
        return prev;
      }

      const updatedSubProjects = prev.subProjects.map((subProject) => {
        const updatedTasks = (subProject.tasks || []).map((task) =>
          task.id === taskId ? { ...task, status: status as TaskDTO['status'] } : task
        );

        const stats = calculateSubProjectStats(updatedTasks);
        const progress = stats.totalTasks
          ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
          : 0;

        return {
          ...subProject,
          tasks: updatedTasks,
          stats,
          progress,
        };
      });

      updatedStatsSnapshot = calculateHierarchyStats(updatedSubProjects);

      return {
        ...prev,
        subProjects: updatedSubProjects,
        stats: updatedStatsSnapshot,
      };
    });

    if (updatedStatsSnapshot) {
      setProject((prev) =>
        prev ? { ...prev, progress: updatedStatsSnapshot!.overallProgress } : prev
      );
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = allTasks.find((t) => t.id === taskId) || null;
    if (!task) {
      toast.error('Görev bulunamadı.');
      return;
    }

    setSelectedTask(task);
    setCompleteNote('');
    setCompleteModalOpen(true);
  };

  const handleTaskQuestion = (taskId: string) => {
    const task = allTasks.find((t) => t.id === taskId) || null;
    if (!task) {
      toast.error('Görev bulunamadı.');
      return;
    }

    setSelectedTask(task);
    setQuestionText('');
    setQuestionModalOpen(true);
  };

  const handleCompleteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTask) {
      toast.error('Görev bilgisine ulaşılamadı.');
      return;
    }

    applyTaskStatusLocally(selectedTask.id, 'review');
    setCompleteLoading(true);

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}/complete`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Görev tamamlanamadı');
      }

      if (completeNote.trim()) {
        await postTaskComment(selectedTask.id, `Firma notu: ${completeNote.trim()}`, {
          errorMessage: 'Not kaydedilemedi, lütfen tekrar deneyin.',
        });
      }

      toast.success('Görev tamamlandı ve danışman onayına gönderildi');
      setCompleteModalOpen(false);
      setSelectedTask(null);
      setCompleteNote('');
      await fetchHierarchy();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error instanceof Error ? error.message : 'Görev tamamlanamadı');
      await fetchHierarchy();
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTask) {
      toast.error('Görev bilgisine ulaşılamadı.');
      return;
    }

    if (!questionText.trim()) {
      toast.error('Sorunuzu yazmalısınız.');
      return;
    }

    setQuestionLoading(true);

    try {
      const success = await postTaskComment(selectedTask.id, questionText.trim(), {
        isQuestion: true,
        successMessage: 'Sorunuz danışmana iletildi',
        errorMessage: 'Sorunuz kaydedilemedi, lütfen tekrar deneyin.',
      });

      if (!success) {
        return;
      }

      setQuestionModalOpen(false);
      setSelectedTask(null);
      setQuestionText('');
    } catch (error) {
      console.error('Error sending question:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Sorunuz iletilemedi');
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleCompleteModalClose = (open: boolean) => {
    setCompleteModalOpen(open);
    if (!open) {
      setSelectedTask(null);
      setCompleteNote('');
    }
  };

  const handleQuestionModalClose = (open: boolean) => {
    setQuestionModalOpen(open);
    if (!open) {
      setSelectedTask(null);
      setQuestionText('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <div className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Proje Bulunamadı
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Proje yüklenemedi'}</p>
            <Button
              onClick={() => router.push('/company-dashboard/projects')}
              className="shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Projelere Dön
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo =
    statusLabels[project.status as keyof typeof statusLabels] || statusLabels.active;
  const priorityInfo = priorityLabels[project.priority] || priorityLabels.medium;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/company-dashboard/projects')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Projelere Dön
              </Button>
              <Badge className={statusInfo.badge}>{statusInfo.label}</Badge>
              <Badge className={priorityInfo.badge}>{priorityInfo.label}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Genel İlerleme</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {Math.round(project.progress ?? 0)}%
              </p>
            </div>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.round(project.progress ?? 0)}%` }}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={CheckCircle2} title="Durum" value={statusInfo.label} />
          <SummaryCard
            icon={TrendingUp}
            title="İlerleme"
            value={`${Math.round(project.progress ?? 0)}%`}
          />
          <SummaryCard icon={Layers} title="Alt Projeler" value={`${subProjects.length}`} />
          <SummaryCard icon={ListTodo} title="Görevler" value={`${taskStats.total}`} />
        </div>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-900">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Genel Bakış
                </TabsTrigger>
                <TabsTrigger
                  value="structure"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Proje Yapısı
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Görevlerim ({taskStats.total})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="overview" className="mt-0 p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Briefcase className="w-5 h-5" /> Proje Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Durum</p>
                        <Badge className={statusInfo.badge}>{statusInfo.label}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Öncelik</p>
                        <Badge className={priorityInfo.badge}>{priorityInfo.label}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Başlangıç Tarihi
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Bitiş Tarihi
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          {formatDate(project.endDate)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {project.consultantName && (
                    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                          <User className="w-5 h-5" /> Danışman
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                            {project.consultantName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">
                              {project.consultantName}
                            </p>
                            {project.consultantEmail && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {project.consultantEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                      <ListTodo className="w-5 h-5" /> Görev İstatistikleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <StatBox label="Toplam" value={taskStats.total} />
                      <StatBox label="Yapılacak" value={taskStats.todo} color="text-gray-500" />
                      <StatBox
                        label="Devam Eden"
                        value={taskStats.inProgress}
                        color="text-blue-600"
                      />
                      <StatBox
                        label="İncelemede"
                        value={taskStats.review}
                        color="text-yellow-600"
                      />
                      <StatBox label="Tamamlandı" value={taskStats.done} color="text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="structure" className="mt-0 p-6 space-y-4">
                {hierarchyLoading ? (
                  <div className="p-12 text-center text-gray-600 dark:text-gray-400">
                    Proje yapısı yükleniyor...
                  </div>
                ) : (
                  <ProjectHierarchyAccordion
                    projectId={projectId}
                    subProjects={subProjects}
                    mode="company"
                    completable
                    onTaskComplete={handleTaskComplete}
                    onTaskQuestion={handleTaskQuestion}
                  />
                )}
              </TabsContent>

              <TabsContent value="tasks" className="mt-0 p-6 space-y-4">
                {allTasks.length === 0 ? (
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <ListTodo className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      Henüz Görev Yok
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Danışmanınız size görev atadığında burada görünecektir.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {allTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="border border-gray-200 dark:border-gray-800 shadow-sm"
                      >
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <Badge
                              className={
                                statusLabels[task.status]?.badge || statusLabels.todo.badge
                              }
                            >
                              {statusLabels[task.status]?.label || task.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="shadow-sm"
                              onClick={() => handleTaskComplete(task.id)}
                              disabled={task.status === 'done' || task.status === 'review'}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Tamamladım
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none"
                              onClick={() => handleTaskQuestion(task.id)}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" /> Soru Sor
                            </Button>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              Alt Proje:{' '}
                              {subProjects.find((sp) => sp.id === task.subProjectId)?.name ||
                                'Belirtilmedi'}
                            </span>
                            <span>
                              Bitiş: {task.dueDate ? formatDate(task.dueDate) : 'Belirtilmemiş'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Dialog open={completeModalOpen} onOpenChange={handleCompleteModalClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Görevi Tamamla</DialogTitle>
            <DialogDescription>
              {selectedTask ? selectedTask.title : 'Tamamlamak istediğiniz görev seçili değil.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompleteSubmit} className="space-y-6">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                Bu görev tamamlandı olarak işaretlenecek ve danışmanın onayına gönderilecektir.
                İsterseniz kısa bir not bırakabilirsiniz.
              </p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="complete-note"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Not (Opsiyonel)
              </label>
              <Textarea
                id="complete-note"
                placeholder="Tamamlama ile ilgili kısa bir not paylaşabilirsiniz."
                value={completeNote}
                onChange={(event) => setCompleteNote(event.target.value)}
                rows={4}
                disabled={completeLoading}
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleCompleteModalClose(false)}
                disabled={completeLoading}
              >
                Vazgeç
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={completeLoading}>
                {completeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Tamamladım
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={questionModalOpen} onOpenChange={handleQuestionModalClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Danışmana Soru Sor</DialogTitle>
            <DialogDescription>
              {selectedTask ? selectedTask.title : 'Soru sormak istediğiniz görev seçili değil.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuestionSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="question-text"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Sorunuz
              </label>
              <Textarea
                id="question-text"
                placeholder="Danışmanınıza iletmek istediğiniz soruyu yazın."
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                rows={5}
                disabled={questionLoading}
                required
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleQuestionModalClose(false)}
                disabled={questionLoading}
              >
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={questionLoading || !questionText.trim()}
              >
                {questionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Soruyu Gönder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, value, description }: SummaryCardProps) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description?: string;
}

interface StatBoxProps {
  label: string;
  value: number;
  color?: string;
}

function StatBox({ label, value, color }: StatBoxProps) {
  return (
    <div className="text-center">
      <p className={`text-3xl font-bold ${color ?? 'text-gray-900 dark:text-white'}`}>{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

const calculateSubProjectStats = (tasks: TaskDTO[]) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;
  const todoTasks = tasks.filter((task) => task.status === 'todo').length;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
  };
};

const calculateHierarchyStats = (
  subProjects: SubProjectWithTasksDTO[]
): ProjectHierarchyDTO['stats'] => {
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let todoTasks = 0;

  subProjects.forEach((subProject) => {
    totalTasks += subProject.stats.totalTasks;
    completedTasks += subProject.stats.completedTasks;
    inProgressTasks += subProject.stats.inProgressTasks;
    todoTasks += subProject.stats.todoTasks;
  });

  const overallProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalSubProjects: subProjects.length,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overallProgress,
  };
};
