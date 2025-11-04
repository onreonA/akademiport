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
  Edit,
  Trash2,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  start_date?: string;
  end_date?: string;
  companyName?: string;
  consultantName?: string;
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

const statusConfig: Record<string, { label: string; color: string }> = {
  planning: {
    label: 'Planlama',
    color:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  active: {
    label: 'Aktif',
    color:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  on_hold: {
    label: 'Beklemede',
    color:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  },
  completed: {
    label: 'Tamamlandı',
    color:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  },
  cancelled: {
    label: 'İptal',
    color:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  todo: {
    label: 'Yapılacak',
    color:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  },
  in_progress: {
    label: 'Devam Ediyor',
    color:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  review: {
    label: 'İncelemede',
    color:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  },
  done: {
    label: 'Tamamlandı',
    color:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: {
    label: 'Düşük',
    color:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  },
  medium: {
    label: 'Orta',
    color:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  high: {
    label: 'Yüksek',
    color:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  },
  urgent: {
    label: 'Acil',
    color:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  critical: {
    label: 'Kritik',
    color:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  },
};

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (project && !loading) {
      fetchSubProjects();
      fetchTasks();
    }
  }, [project, loading]);

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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch project' }));
        throw new Error(errorData.error || 'Failed to fetch project');
      }
      const data = await response.json();
      const projectData = data.project || data;

      const normalizedProject = {
        ...projectData,
        status: projectData.status || 'todo',
        priority: projectData.priority || 'medium',
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Proje Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'Proje bilgileri yüklenemedi'}
            </p>
            <Button onClick={() => router.push('/dashboard/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Projeler Listesi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[project.status] || statusConfig.todo;
  const priorityInfo = priorityConfig[project.priority] || priorityConfig.medium;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Belirtilmemiş';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/projects')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
                <Badge className={`${statusInfo.color} border font-medium px-2.5 py-1`}>
                  {statusInfo.label}
                </Badge>
                <Badge className={`${priorityInfo.color} border font-medium px-2.5 py-1`}>
                  {priorityInfo.label}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                {project.companyName || 'Proje Detayı'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)}
              className="shadow-sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* İlerleme */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    İlerleme
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.progress || 0}%
                  </p>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Durum */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Durum</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {statusInfo.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Öncelik */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Öncelik
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {priorityInfo.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Firma/Danışman */}
          {(project.companyName || project.consultantName) && (
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    {project.companyName ? (
                      <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {project.companyName ? 'Firma' : 'Danışman'}
                    </p>
                    <p
                      className="text-sm font-medium text-gray-900 dark:text-white truncate"
                      title={project.companyName || project.consultantName || 'Belirtilmemiş'}
                    >
                      {project.companyName || project.consultantName || 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Genel Bakış
                </TabsTrigger>
                <TabsTrigger
                  value="subprojects"
                  className="data-[state=active]:bg-primary/10"
                  onClick={() => subProjects.length === 0 && fetchSubProjects()}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Alt Projeler ({subProjects.length})
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-primary/10"
                  onClick={() => tasks.length === 0 && fetchTasks()}
                >
                  <ListTodo className="w-4 h-4 mr-2" />
                  Görevler ({tasks.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Proje Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {project.description && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Açıklama
                          </p>
                          <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                            {project.description}
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Durum
                        </p>
                        <Badge className={`${statusInfo.color} border font-medium`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Öncelik
                        </p>
                        <Badge className={`${priorityInfo.color} border font-medium`}>
                          {priorityInfo.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        İlişkiler
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {project.companyName && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Firma
                          </p>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                            <p className="text-base text-gray-900 dark:text-white">
                              {project.companyName}
                            </p>
                          </div>
                        </div>
                      )}
                      {project.consultantName && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Danışman
                          </p>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                            <p className="text-base text-gray-900 dark:text-white">
                              {project.consultantName}
                            </p>
                          </div>
                        </div>
                      )}
                      {(project.start_date || project.end_date) && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tarih Aralığı
                          </p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                            <p className="text-base text-gray-900 dark:text-white">
                              {project.start_date
                                ? formatDate(project.start_date)
                                : 'Başlangıç yok'}{' '}
                              - {project.end_date ? formatDate(project.end_date) : 'Bitiş yok'}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="subprojects" className="space-y-4 mt-0">
                {subProjects.length === 0 ? (
                  <div className="text-center py-12 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Alt Proje Yok
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Bu projede henüz alt proje bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subProjects.map((subProject) => (
                      <Card
                        key={subProject.id}
                        className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                  {subProject.name}
                                </h3>
                                <Badge
                                  className={`${statusConfig[subProject.status]?.color || statusConfig.todo.color} border font-medium`}
                                >
                                  {statusConfig[subProject.status]?.label || subProject.status}
                                </Badge>
                              </div>
                              {subProject.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {subProject.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    İlerleme: {subProject.progress || 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4 mt-0">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                    <ListTodo className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Görev Yok
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Bu projede henüz görev bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <Card
                        key={task.id}
                        className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge
                                  className={`${statusConfig[task.status]?.color || statusConfig.todo.color} border font-medium`}
                                >
                                  {statusConfig[task.status]?.label || task.status}
                                </Badge>
                                <Badge
                                  className={`${priorityConfig[task.priority]?.color || priorityConfig.medium.color} border font-medium`}
                                >
                                  {priorityConfig[task.priority]?.label || task.priority}
                                </Badge>
                                {task.due_date && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                    <span>{formatDate(task.due_date)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
