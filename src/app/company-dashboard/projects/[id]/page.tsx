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

  useEffect(() => {
    fetchProject();
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
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubProjects = async () => {
    try {
      const response = await fetch(`/api/sub-projects?project_id=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch sub-projects');
      const data = await response.json();
      setSubProjects(data.subProjects || []);
    } catch (err) {
      console.error('Error fetching sub-projects:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?project_id=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-32 bg-muted animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <EnhancedCard variant="neon" className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Proje Bulunamadı</h2>
            <p className="text-muted-foreground mb-4">{error || 'Proje yüklenemedi'}</p>
            <Button onClick={() => router.push('/company-dashboard/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Projelere Dön
            </Button>
          </EnhancedCard>
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
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <GradientHeader
          title={project.name}
          subtitle={project.description}
          icon={Briefcase}
          progress={project.progress}
          actions={
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => router.push('/company-dashboard/projects')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <ModernStatCard
            title="Durum"
            value={statusConfig[project.status].label}
            icon={CheckCircle2}
            color="blue"
            showGlow
          />
          <ModernStatCard
            title="İlerleme"
            value={`${project.progress}%`}
            icon={TrendingUp}
            color="green"
            progress={project.progress}
            showGlow
          />
          <ModernStatCard
            title="Alt Projeler"
            value={subProjects.length}
            icon={FolderOpen}
            color="purple"
          />
          <ModernStatCard title="Görevler" value={taskStats.total} icon={ListTodo} color="orange" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="subprojects">Alt Projeler ({subProjects.length})</TabsTrigger>
            <TabsTrigger value="tasks">Görevlerim ({taskStats.total})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Info */}
              <EnhancedCard variant="glass" className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Proje Bilgileri
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Durum</p>
                    <Badge className={statusConfig[project.status].color}>
                      {statusConfig[project.status].label}
                    </Badge>
                  </div>
                  {project.start_date && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Başlangıç Tarihi</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.start_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  )}
                  {project.end_date && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Bitiş Tarihi</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.end_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  )}
                </div>
              </EnhancedCard>

              {/* Consultant Info */}
              {project.consultant && (
                <EnhancedCard variant="glass" className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Danışman
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">
                      {project.consultant.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{project.consultant.full_name}</p>
                      <p className="text-sm text-muted-foreground">{project.consultant.email}</p>
                    </div>
                  </div>
                </EnhancedCard>
              )}
            </div>

            {/* Task Stats */}
            <EnhancedCard variant="gradient" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ListTodo className="w-5 h-5" />
                Görev İstatistikleri
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{taskStats.total}</p>
                  <p className="text-sm text-muted-foreground">Toplam</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-500">{taskStats.todo}</p>
                  <p className="text-sm text-muted-foreground">Yapılacak</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500">{taskStats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">Devam Eden</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">{taskStats.review}</p>
                  <p className="text-sm text-muted-foreground">İncelemede</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{taskStats.done}</p>
                  <p className="text-sm text-muted-foreground">Tamamlandı</p>
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Sub-Projects Tab */}
          <TabsContent value="subprojects" className="space-y-4">
            {subProjects.length === 0 ? (
              <EnhancedCard variant="glass" className="p-8 text-center">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Henüz Alt Proje Yok</h3>
                <p className="text-muted-foreground">
                  Danışmanınız alt proje eklediğinde burada görünecektir.
                </p>
              </EnhancedCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subProjects.map((subProject) => (
                  <EnhancedCard key={subProject.id} variant="glass" hover className="p-6">
                    <h4 className="text-lg font-bold mb-2">{subProject.name}</h4>
                    {subProject.description && (
                      <p className="text-sm text-muted-foreground mb-4">{subProject.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">İlerleme</span>
                        <span className="font-semibold">{subProject.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-1000"
                          style={{ width: `${subProject.progress}%` }}
                        />
                      </div>
                    </div>
                  </EnhancedCard>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {tasks.length === 0 ? (
              <EnhancedCard variant="glass" className="p-8 text-center">
                <ListTodo className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Henüz Görev Yok</h3>
                <p className="text-muted-foreground">
                  Danışmanınız size görev atadığında burada görünecektir.
                </p>
              </EnhancedCard>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <EnhancedCard
                    key={task.id}
                    variant="glass"
                    hover
                    className="p-6 cursor-pointer"
                    onClick={() => router.push(`/company-dashboard/tasks/${task.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={
                          statusConfig[task.status as keyof typeof statusConfig]?.color ||
                          'bg-gray-500'
                        }
                      >
                        {statusConfig[task.status as keyof typeof statusConfig]?.label ||
                          task.status}
                      </Badge>
                    </div>
                    {task.due_date && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Bitiş: {new Date(task.due_date).toLocaleDateString('tr-TR')}
                      </p>
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
