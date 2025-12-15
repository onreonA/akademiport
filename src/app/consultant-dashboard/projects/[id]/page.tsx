'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ListTodo,
  TrendingUp,
  User,
  Loader2,
  Edit,
  Plus,
  BarChart3,
  AlertCircle,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/1-presentation/components/ui/atoms/tabs';
import { ProjectHierarchyAccordion } from '@/1-presentation/components/features/projects/ProjectHierarchyAccordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/1-presentation/components/ui/atoms/dialog';
import { Label } from '@/1-presentation/components/ui/atoms/label';
import { Textarea } from '@/1-presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/1-presentation/components/ui/atoms/select';
import {
  ProjectHierarchyDTO,
  SubProjectWithTasksDTO,
  TaskDTO,
} from '@/2-application/dto/project-hierarchy.dto';
import { postTaskComment } from '@/1-presentation/utils/taskActions';
import { GradientHeader } from '@/1-presentation/components/ui/molecules/gradient-header';
import { ModernStatCard } from '@/1-presentation/components/ui/atoms/modern-stat-card';
import { EnhancedCard } from '@/1-presentation/components/ui/atoms/enhanced-card';

interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  companyId?: string;
  companyName?: string;
  consultantName?: string;
  startDate?: string;
  endDate?: string;
  assignedCompanies?: Array<{ id: string; name: string }>;
}

interface CompanyUser {
  id: string;
  full_name?: string;
  email?: string;
}

export default function ConsultantProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [hierarchy, setHierarchy] = useState<ProjectHierarchyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const [assignedCompanies, setAssignedCompanies] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [companyUsersLoading, setCompanyUsersLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', note: '' });
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');

  const subProjects: SubProjectWithTasksDTO[] = useMemo(
    () => hierarchy?.subProjects || [],
    [hierarchy]
  );
  const allTasks = useMemo(() => subProjects.flatMap((sp) => sp.tasks || []), [subProjects]);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      const projectData = data.project || data;

      setProject({
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'active',
        priority: projectData.priority || 'medium',
        progress: projectData.progress ?? 0,
        companyId:
          projectData.companyId ||
          projectData.company_id ||
          projectData.company?.id ||
          projectData.project?.company_id,
        companyName: projectData.companyName || projectData.company?.name,
        consultantName: projectData.consultantName || projectData.consultant?.full_name,
        startDate: projectData.startDate || projectData.start_date,
        endDate: projectData.endDate || projectData.end_date,
      });

      // Fetch assigned companies
      try {
        const assignmentsResponse = await fetch(`/api/projects/${projectId}/assignments/companies`);
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignedCompanies(assignmentsData.companies || []);
        }
      } catch {
        // Silently fail if assignments can't be fetched
      }
    } catch (error) {
      // Error handled by UI
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchHierarchy = useCallback(async () => {
    try {
      setHierarchyLoading(true);
      const response = await fetch(`/api/projects/${projectId}/hierarchy`);
      if (!response.ok) throw new Error('Failed to fetch project hierarchy');
      const data = await response.json();
      setHierarchy(data.data || null);
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      toast.error('Proje yapısı yüklenemedi');
    } finally {
      setHierarchyLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchHierarchy();
    }
  }, [projectId, fetchProject, fetchHierarchy]);

  const loadCompanyUsers = useCallback(
    async (force = false) => {
      if (!project?.companyId) {
        toast.error('Firma bilgisi bulunamadı.');
        return;
      }

      if (!force && companyUsers.length > 0) {
        return;
      }

      try {
        setCompanyUsersLoading(true);
        const response = await fetch(`/api/companies/${project.companyId}/users`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Firma kullanıcıları yüklenemedi');
        }

        const data = await response.json();
        setCompanyUsers(data.users || data.data || []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Firma kullanıcıları yüklenemedi');
      } finally {
        setCompanyUsersLoading(false);
      }
    },
    [project?.companyId, companyUsers.length]
  );

  useEffect(() => {
    if (!project?.companyId) {
      setCompanyUsers([]);
      return;
    }

    loadCompanyUsers(true);
  }, [project?.companyId, loadCompanyUsers]);

  const handleTaskAssign = async (taskId: string) => {
    const task = allTasks.find((t) => t.id === taskId) || null;
    if (!task) {
      toast.error('Görev bulunamadı.');
      return;
    }

    setSelectedTask(task);
    setAssignForm({ userId: task.assignedTo ?? '', note: '' });
    setAssignModalOpen(true);

    if (companyUsers.length === 0) {
      await loadCompanyUsers();
    }
  };

  const openDecisionModal = (taskId: string, type: 'approve' | 'reject') => {
    const task = allTasks.find((t) => t.id === taskId) || null;
    if (!task) {
      toast.error('Görev bulunamadı.');
      return;
    }

    setSelectedTask(task);
    setDecisionType(type);
    setDecisionNote('');
    setDecisionModalOpen(true);
  };

  const handleTaskApprove = async (taskId: string) => {
    openDecisionModal(taskId, 'approve');
  };

  const handleTaskReject = async (taskId: string) => {
    openDecisionModal(taskId, 'reject');
  };

  const handleAssignSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTask) {
      toast.error('Görev bilgisine ulaşılamadı.');
      return;
    }

    if (!assignForm.userId) {
      toast.error('Görev ataması için kullanıcı seçmelisiniz.');
      return;
    }

    try {
      setAssignLoading(true);
      const response = await fetch(`/api/tasks/${selectedTask.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: assignForm.userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Görev atanamadı');
      }

      const assignedUser = companyUsers.find((user) => user.id === assignForm.userId);
      if (assignForm.note.trim()) {
        const notePrefix = `Danışman görevi ${assignedUser?.full_name || 'seçilen kullanıcı'} kişisine atadı. Not: `;
        await postTaskComment(selectedTask.id, `${notePrefix}${assignForm.note.trim()}`, {
          errorMessage: 'Not kaydedilemedi, lütfen tekrar deneyin.',
        });
      }

      toast.success('Görev ataması güncellendi');
      setAssignModalOpen(false);
      setSelectedTask(null);
      setAssignForm({ userId: '', note: '' });
      await fetchHierarchy();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Görev atanamadı');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDecisionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTask) {
      toast.error('Görev bilgisine ulaşılamadı.');
      return;
    }

    try {
      setDecisionLoading(true);
      const endpoint = decisionType === 'approve' ? 'approve' : 'reject';
      const response = await fetch(`/api/tasks/${selectedTask.id}/${endpoint}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Görev ${decisionType === 'approve' ? 'onaylanamadı' : 'reddedilemedi'}`
        );
      }

      if (decisionNote.trim()) {
        const prefix =
          decisionType === 'approve' ? 'Danışman onay notu: ' : 'Danışman red gerekçesi: ';
        await postTaskComment(selectedTask.id, `${prefix}${decisionNote.trim()}`, {
          errorMessage: 'Not kaydedilemedi, lütfen tekrar deneyin.',
        });
      }

      toast.success(
        decisionType === 'approve'
          ? 'Görev onaylandı'
          : 'Görev reddedildi ve revizyon için geri gönderildi'
      );
      setDecisionModalOpen(false);
      setSelectedTask(null);
      setDecisionNote('');
      await fetchHierarchy();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : decisionType === 'approve'
            ? 'Görev onaylanamadı'
            : 'Görev reddedilemedi'
      );
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleAssignModalClose = (open: boolean) => {
    setAssignModalOpen(open);
    if (!open) {
      setSelectedTask(null);
      setAssignForm({ userId: '', note: '' });
    }
  };

  const handleDecisionModalClose = (open: boolean) => {
    setDecisionModalOpen(open);
    if (!open) {
      setSelectedTask(null);
      setDecisionNote('');
    }
  };

  const handleTaskView = useCallback(
    (task: TaskDTO) => {
      router.push(`/consultant-dashboard/tasks/${task.id}/edit`);
    },
    [router]
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmedi';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

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
    critical: {
      label: 'Kritik',
      badge:
        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800',
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-32 animate-pulse bg-white/50 dark:bg-gray-800/50 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse bg-white/50 dark:bg-gray-800/50 rounded-xl"
              />
            ))}
          </div>
          <div className="h-96 animate-pulse bg-white/50 dark:bg-gray-800/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6 flex items-center justify-center">
        <EnhancedCard variant="glass" className="max-w-xl mx-auto p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Proje bulunamadı</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            İstediğiniz proje silinmiş veya erişim yetkiniz olmayabilir.
          </p>
          <Button onClick={() => router.back()} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" /> Geri dön
          </Button>
        </EnhancedCard>
      </div>
    );
  }

  const statusInfo =
    statusLabels[project.status as keyof typeof statusLabels] || statusLabels.active;
  const priorityInfo = priorityLabels[project.priority] || priorityLabels.medium;
  const hierarchyStats = hierarchy?.stats;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <GradientHeader
          icon={Briefcase}
          title={project.name}
          subtitle={
            assignedCompanies.length > 0
              ? `${assignedCompanies.length} firma ile çalışılıyor`
              : project.companyName || 'Henüz firma ataması yapılmamış'
          }
          progress={Math.round(project.progress ?? 0)}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/consultant-dashboard/projects/${projectId}/edit`)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Düzenle
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Geri
              </Button>
            </div>
          }
        />

        {/* Status & Priority Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={statusInfo.badge}>{statusInfo.label}</Badge>
          <Badge className={priorityInfo.badge}>{priorityInfo.label}</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernStatCard
            title="Alt Proje"
            value={subProjects.length}
            icon={Layers}
            color="blue"
            showGlow
          />
          <ModernStatCard
            title="Toplam Görev"
            value={hierarchyStats?.totalTasks ?? 0}
            icon={ListTodo}
            color="purple"
            showGlow
          />
          <ModernStatCard
            title="Tamamlanan"
            value={hierarchyStats?.completedTasks ?? 0}
            icon={CheckCircle2}
            color="green"
            progress={
              hierarchyStats?.totalTasks
                ? Math.round(
                    ((hierarchyStats.completedTasks ?? 0) / hierarchyStats.totalTasks) * 100
                  )
                : 0
            }
            showGlow
          />
          <ModernStatCard
            title="Bekleyen"
            value={hierarchyStats?.todoTasks ?? 0}
            icon={Clock}
            color="orange"
            showGlow={hierarchyStats && hierarchyStats.todoTasks > 0}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
            >
              <Target className="w-4 h-4 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger
              value="structure"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
            >
              <Layers className="w-4 h-4 mr-2" />
              Proje Yapısı
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Aktiviteler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Description Card */}
            {project.description && (
              <EnhancedCard variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Proje Açıklaması
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {project.description}
                </p>
              </EnhancedCard>
            )}

            {/* Project Details */}
            <EnhancedCard variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Proje Detayları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                      <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Atanan Firmalar
                      </p>
                      {assignedCompanies.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedCompanies.map((company) => (
                            <Badge
                              key={company.id}
                              variant="outline"
                              className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                            >
                              {company.name}
                            </Badge>
                          ))}
                        </div>
                      ) : project.companyName ? (
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {project.companyName}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          Henüz firma ataması yapılmamış
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Danışman</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {project.consultantName || 'Belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Başlangıç Tarihi
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(project.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Planlanan Bitiş
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(project.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </EnhancedCard>

            {/* Progress Visualization */}
            <EnhancedCard variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                İlerleme Durumu
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Genel İlerleme
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(project.progress ?? 0)}%
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.round(project.progress ?? 0)}%` }}
                    />
                  </div>
                </div>

                {hierarchyStats && hierarchyStats.totalTasks > 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tamamlanan</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {Math.round(
                          ((hierarchyStats.completedTasks ?? 0) / hierarchyStats.totalTasks) * 100
                        )}
                        %
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Devam Eden</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(
                          ((hierarchyStats.inProgressTasks ?? 0) / hierarchyStats.totalTasks) * 100
                        )}
                        %
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Bekleyen</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {Math.round(
                          ((hierarchyStats.todoTasks ?? 0) / hierarchyStats.totalTasks) * 100
                        )}
                        %
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <EnhancedCard variant="glass" className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Proje Yapısı
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Alt projeleri ve görevleri burada yönetebilirsiniz.
                  </p>
                </div>
                <Button
                  onClick={() =>
                    router.push(`/consultant-dashboard/projects/${projectId}/sub-projects/new`)
                  }
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Alt Proje
                </Button>
              </div>
              {hierarchyLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">Proje yapısı yükleniyor...</p>
                </div>
              ) : (
                <ProjectHierarchyAccordion
                  projectId={projectId}
                  subProjects={subProjects}
                  mode="consultant"
                  assignable
                  approvable
                  onTaskAssign={handleTaskAssign}
                  onTaskApprove={handleTaskApprove}
                  onTaskReject={handleTaskReject}
                  onTaskView={handleTaskView}
                />
              )}
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <EnhancedCard variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Aktivite ve İletişim
              </h3>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Danışmanlar için aktivite kaydı, yorum ve soru yönetimi bu bölümde
                  toplulaştırılacak. Mevcut özellikler tamamlandığında buradan takip
                  edebileceksiniz.
                </p>
                <Badge variant="outline" className="text-xs">
                  Yakında eklenecek
                </Badge>
              </div>
            </EnhancedCard>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={assignModalOpen} onOpenChange={handleAssignModalClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Görevi Ata</DialogTitle>
            <DialogDescription>
              {selectedTask ? selectedTask.title : 'Atamak istediğiniz görevi seçin'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="assign-user">Firma Kullanıcısı</Label>
              <Select
                value={assignForm.userId}
                onValueChange={(value) => setAssignForm((prev) => ({ ...prev, userId: value }))}
                disabled={companyUsersLoading || assignLoading}
              >
                <SelectTrigger id="assign-user">
                  <SelectValue
                    placeholder={
                      companyUsersLoading ? 'Kullanıcılar yükleniyor...' : 'Firma kullanıcısı seçin'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {companyUsersLoading ? (
                    <SelectItem value="loading" disabled>
                      Yükleniyor...
                    </SelectItem>
                  ) : companyUsers.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Firma kullanıcısı bulunmuyor
                    </SelectItem>
                  ) : (
                    companyUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || 'İsimsiz Kullanıcı'}
                        {user.email ? ` (${user.email})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign-note">Not (Opsiyonel)</Label>
              <Textarea
                id="assign-note"
                placeholder="Bu atama için kısa bir not bırakabilirsiniz."
                value={assignForm.note}
                onChange={(event) =>
                  setAssignForm((prev) => ({ ...prev, note: event.target.value }))
                }
                disabled={assignLoading}
                rows={3}
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleAssignModalClose(false)}
                disabled={assignLoading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={assignLoading || companyUsersLoading || !assignForm.userId}
              >
                {assignLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Görevi Ata
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={decisionModalOpen} onOpenChange={handleDecisionModalClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {decisionType === 'approve' ? 'Görevi Onayla' : 'Görevi Reddet'}
            </DialogTitle>
            <DialogDescription>
              {selectedTask ? selectedTask.title : 'Karar vermek istediğiniz görev seçili değil.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDecisionSubmit} className="space-y-6">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                Bu işlem sonucunda görev{' '}
                {decisionType === 'approve' ? 'tamamlanmış' : 'revizyon için geri gönderilmiş'}
                <span className="font-semibold"> olarak işaretlenecektir.</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision-note">
                {decisionType === 'approve' ? 'Onay Notu (Opsiyonel)' : 'Red Gerekçesi (Opsiyonel)'}
              </Label>
              <Textarea
                id="decision-note"
                placeholder={
                  decisionType === 'approve'
                    ? 'Onay nedeninizi veya ek notunuzu yazabilirsiniz.'
                    : 'Revizyon için geri gönderme nedeninizi yazabilirsiniz.'
                }
                value={decisionNote}
                onChange={(event) => setDecisionNote(event.target.value)}
                disabled={decisionLoading}
                rows={4}
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleDecisionModalClose(false)}
                disabled={decisionLoading}
              >
                İptal
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={decisionLoading}>
                {decisionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {decisionType === 'approve' ? 'Onayla' : 'Reddet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
