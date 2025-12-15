'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Edit,
  Calendar,
  User,
  FolderTree,
  ListChecks,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
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
  };
  sub_project_count?: number;
  task_count?: number;
  completed_task_count?: number;
}

const statusConfig = {
  todo: { label: 'Yapılacak', color: 'bg-gray-500' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-blue-500' },
  review: { label: 'İncelemede', color: 'bg-yellow-500' },
  done: { label: 'Tamamlandı', color: 'bg-green-500' },
  cancelled: { label: 'İptal', color: 'bg-red-500' },
};

const priorityConfig = {
  low: { label: 'Düşük', color: 'bg-gray-400' },
  medium: { label: 'Orta', color: 'bg-blue-400' },
  high: { label: 'Yüksek', color: 'bg-orange-400' },
  urgent: { label: 'Acil', color: 'bg-red-500' },
};

export default function CompanyProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('isTemplate', 'false'); // Şablonları hariç tut
      const response = await fetch(`/api/projects?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      // Ensure projects have default values for status, priority, and progress
      const projectsWithDefaults = (data.projects || []).map((project: any) => ({
        ...project,
        status: project.status || 'todo',
        priority: project.priority || 'medium',
        progress: project.progress ?? 0,
      }));
      setProjects(projectsWithDefaults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/company-dashboard/projects/${projectId}`);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Hata Oluştu</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchProjects} className="shadow-sm">
              Tekrar Dene
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    completed: projects.filter((p) => p.status === 'done').length,
    avgProgress:
      projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Projelerim
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
            {stats.total} proje • {stats.inProgress} devam ediyor • {stats.completed} tamamlandı
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Proje</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Devam Eden</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tamamlanan</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.completed}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ort. İlerleme</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.avgProgress}%
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-8 md:p-12 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Henüz Proje Yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Danışmanınız size bir proje atadığında burada görünecektir.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project) => {
              const statusInfo = statusConfig[project.status];
              const priorityInfo = priorityConfig[project.priority];
              const daysRemaining = project.end_date
                ? Math.ceil(
                    (new Date(project.end_date).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

              return (
                <Card
                  key={project.id}
                  className="group border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handleProjectClick(project.id)}
                >
                  {/* Colored Top Border */}
                  <div className={`h-1.5 ${statusInfo.color}`} />

                  <CardContent className="p-5 md:p-6">
                    {/* Header with Title and Edit Button */}
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`p-2 rounded-lg ${statusInfo.color.replace('bg-', 'bg-')}/10`}
                          >
                            <Briefcase
                              className={`w-5 h-5 ${statusInfo.color.replace('bg-', 'text-')}`}
                            />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/company-dashboard/projects/${project.id}/edit`);
                        }}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Status and Priority Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${statusInfo.color} text-white border-0 text-xs`}>
                        {statusInfo.label}
                      </Badge>
                      <Badge className={`${priorityInfo.color} text-white border-0 text-xs`}>
                        {priorityInfo.label}
                      </Badge>
                      {daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0 && (
                        <Badge
                          variant="outline"
                          className="border-orange-500 text-orange-600 dark:text-orange-400 text-xs"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {daysRemaining} gün kaldı
                        </Badge>
                      )}
                      {daysRemaining !== null && daysRemaining < 0 && (
                        <Badge
                          variant="outline"
                          className="border-red-500 text-red-600 dark:text-red-400 text-xs"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Gecikmiş
                        </Badge>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          İlerleme
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {project.progress ?? 0}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statusInfo.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${project.progress ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                          <FolderTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Alt Proje</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {project.sub_project_count ?? 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                          <ListChecks className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Görev</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {project.completed_task_count ?? 0}/{project.task_count ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    {(project.start_date || project.end_date) && (
                      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                              Başlangıç
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {project.start_date
                                ? new Date(project.start_date).toLocaleDateString('tr-TR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="flex items-center gap-2 flex-1">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Bitiş</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {project.end_date
                                ? new Date(project.end_date).toLocaleDateString('tr-TR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Consultant Info */}
                    {project.consultant && (
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-white shadow-md">
                            {project.consultant.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                              Danışman
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {project.consultant.full_name}
                            </p>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
