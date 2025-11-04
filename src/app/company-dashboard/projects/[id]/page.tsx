'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Briefcase,
  Calendar,
  User,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  FolderOpen,
  ListTodo,
  Plus,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { SubProjectModal } from '@/presentation/components/features/sub-projects/SubProjectModal';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  start_date?: string;
  end_date?: string;
  consultant?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface SubProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  order_index: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assigned_to?: string;
}

const statusConfig = {
  todo: { label: 'Yapılacak', color: 'bg-gray-500' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-blue-500' },
  review: { label: 'İncelemede', color: 'bg-yellow-500' },
  done: { label: 'Tamamlandı', color: 'bg-green-500' },
  cancelled: { label: 'İptal', color: 'bg-red-500' },
};

export default function CompanyProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [subProjectModalOpen, setSubProjectModalOpen] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState<SubProject | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    // Fetch sub-projects and tasks when project is loaded
    if (project && !loading) {
      fetchSubProjects();
      fetchTasks();
    }
  }, [project, loading]);

  useEffect(() => {
    // Also fetch when tab changes (for refresh)
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch project' }));
        throw new Error(errorData.error || 'Failed to fetch project');
      }
      const data = await response.json();
      // API returns project directly, not wrapped in { project: ... }
      const projectData = data.project || data;

      // Normalize project data to match frontend interface
      const normalizedProject = {
        ...projectData,
        status: (projectData.status || 'todo') as Project['status'],
        priority: (projectData.priority || 'medium') as Project['priority'],
        progress: projectData.progress ?? 0,
        start_date: projectData.startDate || projectData.start_date,
        end_date: projectData.endDate || projectData.end_date,
      };

      setProject(normalizedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubProjects = async () => {
    try {
      const response = await fetch(`/api/sub-projects?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch sub-projects');
      const data = await response.json();
      // API returns array directly or wrapped in data
      setSubProjects(Array.isArray(data) ? data : data.subProjects || data.data || []);
    } catch (err) {
      console.error('Error fetching sub-projects:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks || data.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Projelere Dön
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/company-dashboard/projects')}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
            </div>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                className={`${statusConfig[project.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white border-0`}
              >
                {statusConfig[project.status as keyof typeof statusConfig]?.label || project.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Durum</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {statusConfig[project.status as keyof typeof statusConfig]?.label ||
                      'Bilinmiyor'}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">İlerleme</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {project.progress}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-1000"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alt Projeler</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {subProjects.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Görevler</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {taskStats.total}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <ListTodo className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
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
                  value="subprojects"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Alt Projeler ({subProjects.length})
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
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Info */}
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Briefcase className="w-5 h-5" />
                        Proje Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Durum</p>
                        <Badge
                          className={`${statusConfig[project.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white border-0`}
                        >
                          {statusConfig[project.status as keyof typeof statusConfig]?.label ||
                            project.status ||
                            'Bilinmiyor'}
                        </Badge>
                      </div>
                      {project.start_date && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Başlangıç Tarihi
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            {new Date(project.start_date).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      )}
                      {project.end_date && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Bitiş Tarihi
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            {new Date(project.end_date).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Consultant Info */}
                  {project.consultant && (
                    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                          <User className="w-5 h-5" />
                          Danışman
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                            {project.consultant.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">
                              {project.consultant.full_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {project.consultant.email}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Task Stats */}
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                      <ListTodo className="w-5 h-5" />
                      Görev İstatistikleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {taskStats.total}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Toplam</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-500 dark:text-gray-400">
                          {taskStats.todo}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Yapılacak</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {taskStats.inProgress}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Devam Eden</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                          {taskStats.review}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">İncelemede</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {taskStats.done}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlandı</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sub-Projects Tab */}
              <TabsContent value="subprojects" className="mt-0 p-6 space-y-4">
                <div className="flex justify-end mb-4">
                  <SubProjectModal
                    projectId={projectId}
                    open={subProjectModalOpen}
                    onOpenChange={(open) => {
                      setSubProjectModalOpen(open);
                      if (!open) setEditingSubProject(null);
                    }}
                    subProject={editingSubProject}
                    onSuccess={() => {
                      fetchSubProjects();
                    }}
                    trigger={
                      <Button onClick={() => setSubProjectModalOpen(true)} className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Alt Proje
                      </Button>
                    }
                  />
                </div>
                {subProjects.length === 0 ? (
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <FolderOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      Henüz Alt Proje Yok
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Danışmanınız alt proje eklediğinde burada görünecektir.
                    </p>
                    <Button onClick={() => setSubProjectModalOpen(true)} className="shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Alt Projeyi Oluştur
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subProjects.map((subProject) => (
                      <Card
                        key={subProject.id}
                        className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                                {subProject.name}
                              </h4>
                              {subProject.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  {subProject.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSubProject(subProject);
                                setSubProjectModalOpen(true);
                              }}
                              className="hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">İlerleme</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {subProject.progress}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-1000"
                                style={{ width: `${subProject.progress}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-0 p-6 space-y-4">
                {tasks.length === 0 ? (
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
                    {tasks.map((task) => (
                      <Card
                        key={task.id}
                        className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/company-dashboard/tasks/${task.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <Badge
                              className={`${statusConfig[task.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white border-0`}
                            >
                              {statusConfig[task.status as keyof typeof statusConfig]?.label ||
                                task.status}
                            </Badge>
                          </div>
                          {task.due_date && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Bitiş: {new Date(task.due_date).toLocaleDateString('tr-TR')}
                            </p>
                          )}
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
    </div>
  );
}
