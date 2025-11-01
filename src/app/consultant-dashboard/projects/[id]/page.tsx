'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FolderKanban, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  companyName?: string;
  consultantName?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface SubProject {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
}

export default function ConsultantProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (activeTab === 'subprojects' && subProjects.length === 0) {
      fetchSubProjects();
    } else if (activeTab === 'tasks' && tasks.length === 0) {
      fetchTasks();
    }
  }, [activeTab]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubProjects = async () => {
    try {
      const response = await fetch(`/api/sub-projects?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch sub-projects');
      const data = await response.json();
      setSubProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sub-projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
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
    } catch (error) {
      console.error('Error deleting sub-project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <EnhancedCard className="p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">Proje Bulunamadı</h3>
          <Button onClick={() => router.back()}>Geri Dön</Button>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <GradientHeader
          icon={FolderKanban}
          title={project.name}
          subtitle={project.companyName || 'Proje Detayı'}
          progress={project.progress}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
              <Button
                onClick={() => router.push(`/consultant-dashboard/projects/${projectId}/edit`)}
                className="bg-white hover:bg-white/90 text-primary"
              >
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
            </div>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="subprojects">Alt Projeler</TabsTrigger>
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <EnhancedCard variant="glass" className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Proje Bilgileri</h3>
              <div className="space-y-3">
                {project.description && (
                  <div>
                    <span className="text-sm text-muted-foreground">Açıklama:</span>
                    <p className="mt-1">{project.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Durum:</span>
                    <Badge className="ml-2">{project.status}</Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Öncelik:</span>
                    <Badge className="ml-2">{project.priority}</Badge>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="subprojects" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Alt Projeler</h3>
                <p className="text-sm text-muted-foreground">{subProjects.length} alt proje</p>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  router.push(`/consultant-dashboard/projects/${projectId}/sub-projects/new`)
                }
              >
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
                  Projenizi daha küçük parçalara ayırmak için alt projeler oluşturun
                </p>
                <Button
                  onClick={() =>
                    router.push(`/consultant-dashboard/projects/${projectId}/sub-projects/new`)
                  }
                >
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
                    onClick={() =>
                      router.push(
                        `/consultant-dashboard/projects/${projectId}/sub-projects/${subProject.id}/edit`
                      )
                    }
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
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/consultant-dashboard/projects/${projectId}/sub-projects/${subProject.id}/edit`
                            );
                          }}
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
              <h3 className="text-lg font-semibold">Görevler</h3>
              <Button
                size="sm"
                onClick={() => router.push(`/consultant-dashboard/projects/${projectId}/tasks/new`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Yeni Görev
              </Button>
            </div>
            {tasks.length === 0 ? (
              <EnhancedCard variant="glass" className="p-12 text-center">
                <p className="text-muted-foreground">Henüz görev yok</p>
              </EnhancedCard>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <EnhancedCard key={task.id} variant="glass" className="p-4">
                    <h4 className="font-semibold">{task.title}</h4>
                    {task.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </EnhancedCard>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
