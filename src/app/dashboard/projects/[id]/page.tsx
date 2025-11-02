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
} from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { ModernStatCard } from '@/presentation/components/ui/atoms/modern-stat-card';
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
  planning: { label: 'Planlama', color: 'bg-blue-500' },
  active: { label: 'Aktif', color: 'bg-green-500' },
  on_hold: { label: 'Beklemede', color: 'bg-yellow-500' },
  completed: { label: 'Tamamlandı', color: 'bg-purple-500' },
  cancelled: { label: 'İptal', color: 'bg-red-500' },
  todo: { label: 'Yapılacak', color: 'bg-gray-500' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-blue-500' },
  review: { label: 'İncelemede', color: 'bg-yellow-500' },
  done: { label: 'Tamamlandı', color: 'bg-green-500' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'bg-gray-400' },
  medium: { label: 'Orta', color: 'bg-blue-400' },
  high: { label: 'Yüksek', color: 'bg-orange-400' },
  urgent: { label: 'Acil', color: 'bg-red-500' },
  critical: { label: 'Kritik', color: 'bg-red-500' },
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto p-6">
        <EnhancedCard variant="neon" className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Proje Bulunamadı</h2>
          <p className="text-muted-foreground mb-4">{error || 'Proje yüklenemedi'}</p>
          <Button onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Projeler Listesi
          </Button>
        </EnhancedCard>
      </div>
    );
  }

  const statusInfo = statusConfig[project.status] || statusConfig.todo;
  const priorityInfo = priorityConfig[project.priority] || priorityConfig.medium;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <GradientHeader
        title={project.name}
        subtitle={project.companyName || 'Proje Detayı'}
        icon={Briefcase}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/projects')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="subprojects">Alt Projeler ({subProjects.length})</TabsTrigger>
          <TabsTrigger value="tasks">Görevler ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernStatCard
              title="İlerleme"
              value={`${project.progress || 0}%`}
              icon={TrendingUp}
              color="blue"
              progress={project.progress || 0}
            />
            <ModernStatCard
              title="Durum"
              value={statusInfo.label}
              icon={CheckCircle2}
              color="green"
            />
            <ModernStatCard
              title="Öncelik"
              value={priorityInfo.label}
              icon={AlertCircle}
              color="orange"
            />
          </div>

          {/* Project Details */}
          <EnhancedCard variant="glass" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
              </div>

              {project.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Açıklama</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                {project.companyName && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Firma</p>
                      <p className="font-medium">{project.companyName}</p>
                    </div>
                  </div>
                )}
                {project.consultantName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Danışman</p>
                      <p className="font-medium">{project.consultantName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="subprojects" className="space-y-4">
          {subProjects.length === 0 ? (
            <EnhancedCard variant="glass" className="p-12 text-center">
              <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Alt Proje Yok</h3>
              <p className="text-muted-foreground">Bu projede henüz alt proje bulunmuyor.</p>
            </EnhancedCard>
          ) : (
            subProjects.map((subProject) => (
              <EnhancedCard key={subProject.id} variant="glass" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{subProject.name}</h3>
                    {subProject.description && (
                      <p className="text-sm text-muted-foreground mb-4">{subProject.description}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <Badge className={statusConfig[subProject.status]?.color || 'bg-gray-500'}>
                        {statusConfig[subProject.status]?.label || subProject.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        İlerleme: {subProject.progress || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            ))
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {tasks.length === 0 ? (
            <EnhancedCard variant="glass" className="p-12 text-center">
              <ListTodo className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Görev Yok</h3>
              <p className="text-muted-foreground">Bu projede henüz görev bulunmuyor.</p>
            </EnhancedCard>
          ) : (
            tasks.map((task) => (
              <EnhancedCard key={task.id} variant="glass" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <Badge className={statusConfig[task.status]?.color || 'bg-gray-500'}>
                        {statusConfig[task.status]?.label || task.status}
                      </Badge>
                      <Badge className={priorityConfig[task.priority]?.color || 'bg-gray-400'}>
                        {priorityConfig[task.priority]?.label || task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {new Date(task.due_date).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
