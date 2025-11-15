'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2,
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  FolderKanban,
  Plus,
  Table,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { SubProjectModal } from '@/presentation/components/features/sub-projects/SubProjectModal';
import { TaskModal } from '@/presentation/components/features/tasks/TaskModal';
import { ProjectHierarchyAccordion } from '@/presentation/components/features/projects/ProjectHierarchyAccordion';
import {
  ProjectHierarchyDTO,
  SubProjectWithTasksDTO,
} from '@/application/dto/project-hierarchy.dto';
import { ProjectAssignmentMatrix } from '@/presentation/components/features/projects/ProjectAssignmentMatrix';
import { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';
import { toast } from 'sonner';
import Link from 'next/link';

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

interface Template {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: string;
  updatedAt: string;
}

interface SubProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  orderIndex: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  orderIndex: number;
  subProjectId: string;
}

export default function EditProjectTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subProjectHierarchy, setSubProjectHierarchy] = useState<SubProjectWithTasksDTO[]>([]);
  const [structureLoading, setStructureLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [subProjectModalOpen, setSubProjectModalOpen] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState<SubProject | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<string>('');
  const [assignmentMatrix, setAssignmentMatrix] = useState<ProjectAssignmentMatrixDTO | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
  });

  useEffect(() => {
    fetchTemplate();
    fetchHierarchy();
  }, [templateId]);

  useEffect(() => {
    if (activeTab === 'structure' && subProjectHierarchy.length === 0) {
      fetchHierarchy();
    }
  }, [activeTab, subProjectHierarchy.length]);

  useEffect(() => {
    if (activeTab === 'assignments' && !assignmentMatrix && !matrixLoading) {
      fetchAssignmentMatrix();
    }
  }, [activeTab, assignmentMatrix, matrixLoading]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      const data = await response.json();
      setTemplate(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Şablon yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      setStructureLoading(true);
      const response = await fetch(`/api/projects/${templateId}/hierarchy`);
      if (!response.ok) throw new Error('Failed to fetch project hierarchy');

      const data: { data?: ProjectHierarchyDTO } = await response.json();
      const hierarchy = data.data;

      if (!hierarchy) {
        setSubProjectHierarchy([]);
        setSubProjects([]);
        setTasks([]);
        return;
      }

      const subProjectsData = Array.isArray(hierarchy.subProjects) ? hierarchy.subProjects : [];

      console.log('📁 [Edit Template] Hierarchy fetched:', {
        subProjectCount: subProjectsData.length,
        totalTasks: subProjectsData.reduce((acc, sp) => acc + (sp.tasks?.length || 0), 0),
      });

      setSubProjectHierarchy(subProjectsData);

      const formattedSubProjects: SubProject[] = subProjectsData
        .map((sp) => ({
          id: sp.id,
          name: sp.name,
          description: sp.description,
          status: sp.status,
          progress: sp.progress ?? sp.stats?.completedTasks ?? 0,
          orderIndex: sp.orderIndex ?? 0,
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex);

      const formattedTasks: Task[] = subProjectsData
        .flatMap((sp) =>
          (sp.tasks || []).map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            orderIndex: task.orderIndex ?? 0,
            subProjectId: task.subProjectId,
          }))
        )
        .sort((a, b) => a.orderIndex - b.orderIndex);

      setSubProjects(formattedSubProjects);
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching project hierarchy:', error);
      toast.error('Proje yapısı yüklenemedi');
    } finally {
      setStructureLoading(false);
    }
  };

  const fetchAssignmentMatrix = async () => {
    try {
      setMatrixLoading(true);
      setMatrixError(null);
      const response = await fetch(`/api/projects/${templateId}/assignment-matrix`);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Atama matrisi yüklenemedi');
      }

      const data: ProjectAssignmentMatrixDTO = await response.json();
      setAssignmentMatrix(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Atama matrisi yüklenemedi';
      setMatrixError(message);
      toast.error(message);
    } finally {
      setMatrixLoading(false);
    }
  };

  const handleSubProjectModalSuccess = () => {
    fetchHierarchy();
    setSubProjectModalOpen(false);
    setEditingSubProject(null);
  };

  const handleCreateSubProject = () => {
    setEditingSubProject(null);
    setSubProjectModalOpen(true);
  };

  const handleDeleteSubProject = async (subProjectId: string) => {
    if (
      !confirm('Bu alt projeyi silmek istediğinizden emin misiniz? Tüm görevler de silinecektir.')
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/sub-projects/${subProjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sub-project');
      }

      toast.success('Alt proje başarıyla silindi!');
      await fetchHierarchy();
    } catch (error) {
      console.error('Error deleting sub-project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  const handleTaskModalSuccess = () => {
    fetchHierarchy();
    setTaskModalOpen(false);
    setEditingTask(null);
    setSelectedSubProjectId('');
  };

  const handleCreateTask = (subProjectId: string) => {
    setSelectedSubProjectId(subProjectId);
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedSubProjectId(task.subProjectId);
    setTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      toast.success('Görev başarıyla silindi!');
      await fetchHierarchy();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  const handleMoveSubProject = async (subProjectId: string, direction: 'up' | 'down') => {
    const orderedSubProjects = [...subProjects].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = orderedSubProjects.findIndex((sp) => sp.id === subProjectId);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedSubProjects.length) {
      return;
    }

    const current = orderedSubProjects[currentIndex];
    const target = orderedSubProjects[targetIndex];

    try {
      const [currentResponse, targetResponse] = await Promise.all([
        fetch(`/api/sub-projects/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: target.orderIndex }),
        }),
        fetch(`/api/sub-projects/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: current.orderIndex }),
        }),
      ]);

      if (!currentResponse.ok || !targetResponse.ok) {
        const currentError = await currentResponse.json().catch(() => ({}));
        const targetError = await targetResponse.json().catch(() => ({}));
        throw new Error(
          currentError.error || targetError.error || 'Alt proje sırası güncellenemedi'
        );
      }

      toast.success('Alt proje sırası güncellendi');
      await fetchHierarchy();
    } catch (error) {
      console.error('Error updating sub-project order:', error);
      toast.error(error instanceof Error ? error.message : 'Alt proje sırası güncellenemedi');
    }
  };

  const handleMoveTask = async (taskId: string, direction: 'up' | 'down') => {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) {
      return;
    }

    const tasksInSubProject = tasks
      .filter((task) => task.subProjectId === currentTask.subProjectId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

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
          body: JSON.stringify({ orderIndex: targetTask.orderIndex }),
        }),
        fetch(`/api/tasks/${targetTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: currentTask.orderIndex }),
        }),
      ]);

      if (!currentResponse.ok || !targetResponse.ok) {
        const currentError = await currentResponse.json().catch(() => ({}));
        const targetError = await targetResponse.json().catch(() => ({}));
        throw new Error(currentError.error || targetError.error || 'Görev sırası güncellenemedi');
      }

      toast.success('Görev sırası güncellendi');
      await fetchHierarchy();
    } catch (error) {
      console.error('Error updating task order:', error);
      toast.error(error instanceof Error ? error.message : 'Görev sırası güncellenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isTemplate: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update template');
      }

      toast.success('Şablon başarıyla güncellendi!');
      router.push('/dashboard/project-templates');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu şablonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete template');
      }

      toast.success('Şablon başarıyla silindi!');
      router.push('/dashboard/project-templates');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Şablon yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Şablon bulunamadı</p>
          <Link href="/dashboard/project-templates">
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalHierarchyTasks = subProjectHierarchy.reduce(
    (acc, sp) => acc + (sp.tasks?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Flat Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href="/dashboard/project-templates">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="space-y-2 flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Şablon Düzenle
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
                {template?.name ?? 'Şablon'}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="structure">
              <FolderKanban className="w-4 h-4 mr-2" />
              Proje Yapısı
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <Table className="w-4 h-4 mr-2" />
              Atamalar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <EnhancedCard variant="glass" className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Şablon Adı <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: E-İhracat Başlangıç Şablonu"
                    required
                    disabled={saving || deleting}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Şablon hakkında detaylı açıklama..."
                    rows={4}
                    disabled={saving || deleting}
                  />
                </div>

                {/* Status & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Durum</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as ProjectStatus })
                      }
                      disabled={saving || deleting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
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

                  <div className="space-y-2">
                    <Label htmlFor="priority">Öncelik</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value as ProjectPriority })
                      }
                      disabled={saving || deleting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Öncelik seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Düşük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                        <SelectItem value="critical">Kritik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Info */}
                <EnhancedCard className="bg-blue-50/50 border-blue-200 p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Not:</strong> Bu şablonu düzenlediğinizde, mevcut projeler etkilenmez.
                    Yalnızca yeni projeler oluşturulurken bu güncellenmiş şablon kullanılır.
                  </p>
                </EnhancedCard>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={saving || deleting || !formData.name}
                    className="flex-1"
                  >
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
                    onClick={() => router.push('/dashboard/project-templates')}
                    disabled={saving || deleting}
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Proje Yapısı
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subProjectHierarchy.length} alt proje, {totalHierarchyTasks} görev
                </p>
              </div>
              <Button size="sm" onClick={handleCreateSubProject}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Alt Proje
              </Button>
            </div>

            {structureLoading ? (
              <EnhancedCard className="p-12 text-center shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  Proje yapısı yükleniyor...
                </p>
              </EnhancedCard>
            ) : (
              <ProjectHierarchyAccordion
                projectId={templateId}
                subProjects={subProjectHierarchy}
                mode="admin"
                editable
                reorderable
                onSubProjectEdit={(subProject) => {
                  const matched = subProjects.find((sp) => sp.id === subProject.id);
                  setEditingSubProject(
                    (matched || {
                      id: subProject.id,
                      name: subProject.name,
                      description: subProject.description,
                      status: subProject.status,
                      progress: subProject.progress ?? 0,
                      orderIndex: subProject.orderIndex ?? 0,
                    }) as SubProject
                  );
                  setSubProjectModalOpen(true);
                }}
                onSubProjectDelete={handleDeleteSubProject}
                onSubProjectMoveUp={(id) => handleMoveSubProject(id, 'up')}
                onSubProjectMoveDown={(id) => handleMoveSubProject(id, 'down')}
                onTaskEdit={(task) => {
                  const matched = tasks.find((t) => t.id === task.id);
                  handleEditTask(
                    (matched || {
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      priority: task.priority,
                      orderIndex: task.orderIndex ?? 0,
                      subProjectId: task.subProjectId,
                    }) as Task
                  );
                }}
                onTaskDelete={handleDeleteTask}
                onTaskMoveUp={(taskId) => handleMoveTask(taskId, 'up')}
                onTaskMoveDown={(taskId) => handleMoveTask(taskId, 'down')}
                onTaskCreate={(subProjectId) => handleCreateTask(subProjectId)}
              />
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <ProjectAssignmentMatrix
              matrix={assignmentMatrix}
              loading={matrixLoading}
              error={matrixError}
              onRefresh={fetchAssignmentMatrix}
            />
          </TabsContent>
        </Tabs>

        {/* SubProject Modal */}
        <SubProjectModal
          projectId={templateId}
          subProject={editingSubProject ? {
            ...editingSubProject,
            order_index: editingSubProject.orderIndex,
          } : null}
          open={subProjectModalOpen}
          onOpenChange={(open) => {
            setSubProjectModalOpen(open);
            if (!open) {
              setEditingSubProject(null);
            }
          }}
          onSuccess={handleSubProjectModalSuccess}
        />

        {/* Task Modal */}
        {selectedSubProjectId && (
          <TaskModal
            subProjectId={selectedSubProjectId}
            task={editingTask}
            open={taskModalOpen}
            onOpenChange={(open) => {
              setTaskModalOpen(open);
              if (!open) {
                setEditingTask(null);
                setSelectedSubProjectId('');
              }
            }}
            onSuccess={handleTaskModalSuccess}
          />
        )}
      </div>
    </div>
  );
}
