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
  ListTodo,
  Plus,
  Edit,
} from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
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
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { SubProjectModal } from '@/presentation/components/features/sub-projects/SubProjectModal';
import { TaskModal } from '@/presentation/components/features/tasks/TaskModal';
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
  const [activeTab, setActiveTab] = useState('details');
  const [subProjectModalOpen, setSubProjectModalOpen] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState<SubProject | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
  });

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    if (activeTab === 'subprojects') {
      fetchSubProjects();
    } else if (activeTab === 'tasks') {
      fetchTasks();
      if (subProjects.length === 0) {
        fetchSubProjects();
      }
    }
  }, [activeTab]);

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

  const fetchSubProjects = async () => {
    try {
      const response = await fetch(`/api/sub-projects?projectId=${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch sub-projects');
      const data = await response.json();
      setSubProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sub-projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${templateId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubProjectModalSuccess = () => {
    fetchSubProjects();
    setSubProjectModalOpen(false);
    setEditingSubProject(null);
  };

  const handleEditSubProject = (subProject: SubProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubProject(subProject);
    setSubProjectModalOpen(true);
  };

  const handleCreateSubProject = () => {
    setEditingSubProject(null);
    setSubProjectModalOpen(true);
  };

  const handleDeleteSubProject = async (subProjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      setSubProjects(subProjects.filter((sp) => sp.id !== subProjectId));
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error deleting sub-project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  const handleTaskModalSuccess = () => {
    fetchTasks();
    setTaskModalOpen(false);
    setEditingTask(null);
    setSelectedSubProjectId('');
  };

  const handleCreateTask = (subProjectId: string) => {
    setSelectedSubProjectId(subProjectId);
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setSelectedSubProjectId(task.subProjectId);
    setTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
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

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <GradientHeader
          icon={Building2}
          title="Şablon Düzenle"
          subtitle={template.name}
          progress={0}
          actions={
            <Link href="/dashboard/project-templates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="subprojects">Alt Projeler</TabsTrigger>
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
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

          <TabsContent value="subprojects" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Alt Projeler</h3>
                <p className="text-sm text-muted-foreground">{subProjects.length} alt proje</p>
              </div>
              <Button size="sm" onClick={handleCreateSubProject}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Alt Proje
              </Button>
            </div>
            {subProjects.length === 0 ? (
              <EnhancedCard variant="glass" className="p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FolderKanban className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Henüz alt proje yok</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Şablonunuza alt projeler ekleyerek yapıyı oluşturun
                </p>
                <Button onClick={handleCreateSubProject}>
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Alt Projeyi Oluştur
                </Button>
              </EnhancedCard>
            ) : (
              <div className="grid gap-4">
                {subProjects.map((subProject) => (
                  <EnhancedCard
                    key={subProject.id}
                    variant="glass"
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={(e) => handleEditSubProject(subProject, e)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{subProject.name}</h4>
                          <Badge
                            variant={
                              subProject.status === 'done'
                                ? 'default'
                                : subProject.status === 'in_progress'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {subProject.status === 'todo' && 'Yapılacak'}
                            {subProject.status === 'in_progress' && 'Devam Ediyor'}
                            {subProject.status === 'review' && 'İncelemede'}
                            {subProject.status === 'done' && 'Tamamlandı'}
                            {subProject.status === 'cancelled' && 'İptal'}
                          </Badge>
                        </div>
                        {subProject.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {subProject.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">İlerleme</span>
                              <span className="font-medium">{subProject.progress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all"
                                style={{ width: `${subProject.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditSubProject(subProject, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteSubProject(subProject.id, e)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </EnhancedCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">Görevler</h3>
                <p className="text-sm text-muted-foreground">{tasks.length} görev</p>
              </div>
            </div>
            {tasks.length === 0 ? (
              <EnhancedCard variant="glass" className="p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ListTodo className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Henüz görev yok</h4>
                <p className="text-sm text-muted-foreground">
                  Önce alt projeler oluşturun, sonra alt projeler için görevler ekleyebilirsiniz.
                </p>
              </EnhancedCard>
            ) : (
              <div className="grid gap-4">
                {subProjects.map((subProject) => {
                  const subProjectTasks = tasks.filter(
                    (task) => task.subProjectId === subProject.id
                  );
                  if (subProjectTasks.length === 0) return null;

                  return (
                    <EnhancedCard key={subProject.id} variant="glass" className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FolderKanban className="w-4 h-4" />
                          {subProject.name}
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateTask(subProject.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Görev Ekle
                        </Button>
                      </div>
                      <div className="space-y-2 ml-6">
                        {subProjectTasks.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Bu alt projede henüz görev yok.
                          </p>
                        ) : (
                          subProjectTasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-3 border rounded-lg bg-muted/50 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                              onClick={(e) => handleEditTask(task, e)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{task.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {task.status === 'todo' && 'Yapılacak'}
                                    {task.status === 'in_progress' && 'Devam Ediyor'}
                                    {task.status === 'review' && 'İncelemede'}
                                    {task.status === 'done' && 'Tamamlandı'}
                                    {task.status === 'cancelled' && 'İptal'}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleEditTask(task, e)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDeleteTask(task.id, e)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </EnhancedCard>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* SubProject Modal */}
        <SubProjectModal
          projectId={templateId}
          subProject={editingSubProject}
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
