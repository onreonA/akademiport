'use client';

import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { ProjectHierarchyAccordion } from '@/presentation/components/features/projects/ProjectHierarchyAccordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
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
  companyId?: string;
  companyName?: string;
  consultantName?: string;
  startDate?: string;
  endDate?: string;
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

  const subProjects: SubProjectWithTasksDTO[] = hierarchy?.subProjects || [];
  const allTasks = useMemo(() => subProjects.flatMap((sp) => sp.tasks || []), [subProjects]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchHierarchy();
    }
  }, [projectId]);

  const fetchProject = async () => {
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
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
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
  };

  const loadCompanyUsers = async (force = false) => {
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
      console.error('Error fetching company users:', error);
      toast.error(error instanceof Error ? error.message : 'Firma kullanıcıları yüklenemedi');
    } finally {
      setCompanyUsersLoading(false);
    }
  };

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
      console.error('Error assigning task:', error);
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
      console.error(`Error ${decisionType === 'approve' ? 'approving' : 'rejecting'} task:`, error);
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

  useEffect(() => {
    if (!project?.companyId) {
      setCompanyUsers([]);
      return;
    }

    loadCompanyUsers(true);
  }, [project?.companyId]);

  const handleTaskView = (task: TaskDTO) => {
    router.push(`/consultant-dashboard/tasks/${task.id}/edit`);
  };

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <Card className="max-w-xl mx-auto border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-10 text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Proje bulunamadı
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              İstediğiniz proje silinmiş veya erişim yetkiniz olmayabilir.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Geri dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo =
    statusLabels[project.status as keyof typeof statusLabels] || statusLabels.active;
  const priorityInfo = priorityLabels[project.priority] || priorityLabels.medium;
  const hierarchyStats = hierarchy?.stats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-3">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Geri
                </Button>
                <Badge className={statusInfo.badge}>{statusInfo.label}</Badge>
                <Badge className={priorityInfo.badge}>{priorityInfo.label}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.companyName || 'Şirket bilgisi belirtilmemiş'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Genel İlerleme</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(project.progress ?? 0)}%
                </p>
              </div>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${Math.round(project.progress ?? 0)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Briefcase className="w-4 h-4" /> Şirket
                </div>
                <CardTitle className="text-base text-gray-900 dark:text-white font-medium">
                  {project.companyName || 'Belirtilmemiş'}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" /> Danışman
                </div>
                <CardTitle className="text-base text-gray-900 dark:text-white font-medium">
                  {project.consultantName || 'Belirtilmemiş'}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" /> Başlangıç
                </div>
                <CardTitle className="text-base text-gray-900 dark:text-white font-medium">
                  {formatDate(project.startDate)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" /> Planlanan Bitiş
                </div>
                <CardTitle className="text-base text-gray-900 dark:text-white font-medium">
                  {formatDate(project.endDate)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="structure">Proje Yapısı</TabsTrigger>
            <TabsTrigger value="activity">Aktiviteler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Proje Özeti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.description ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bu proje için açıklama henüz eklenmemiş.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <StatusIcon icon={Layers} label="Alt Proje" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Alt Proje Sayısı</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {subProjects.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <StatusIcon icon={CheckCircle2} label="Görev" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Görev Sayısı</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {hierarchyStats?.totalTasks ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <StatusIcon icon={TrendingUp} label="Tamamlanan" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan Görev</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {hierarchyStats?.completedTasks ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <StatusIcon icon={ListTodo} label="Bekleyen" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bekleyen Görev</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {hierarchyStats?.todoTasks ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Proje Yapısı
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Alt projeleri ve görevleri burada yönetebilirsiniz.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {hierarchyLoading ? (
                  <div className="p-12 text-center text-gray-600 dark:text-gray-400">
                    Proje yapısı yükleniyor...
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Aktivite ve İletişim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Danışmanlar için aktivite kaydı, yorum ve soru yönetimi bu bölümde
                  toplulaştırılacak. Mevcut özellikler tamamlandığında buradan takip
                  edebileceksiniz.
                </p>
                <Button variant="outline" className="shadow-none" disabled>
                  Yakında eklenecek
                </Button>
              </CardContent>
            </Card>
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

interface StatusIconProps {
  icon: LucideIcon;
  label: string;
}

function StatusIcon({ icon: Icon, label }: StatusIconProps) {
  return (
    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300 shrink-0">
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
