'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';

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
      const response = await fetch('/api/projects');
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
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-32 bg-muted animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <EnhancedCard variant="neon" className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Hata Oluştu</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProjects}>Tekrar Dene</Button>
          </EnhancedCard>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <GradientHeader
          title="Projelerim"
          subtitle={`${stats.total} proje • ${stats.inProgress} devam ediyor • ${stats.completed} tamamlandı`}
          icon={Briefcase}
          progress={stats.avgProgress}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <EnhancedCard variant="gradient" hover className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Toplam Proje</p>
                <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-primary opacity-50" />
            </div>
          </EnhancedCard>

          <EnhancedCard variant="gradient" hover className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Devam Eden</p>
                <p className="text-2xl md:text-3xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 md:w-10 md:h-10 text-blue-500 opacity-50" />
            </div>
          </EnhancedCard>

          <EnhancedCard variant="gradient" hover className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tamamlanan</p>
                <p className="text-2xl md:text-3xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-500 opacity-50" />
            </div>
          </EnhancedCard>

          <EnhancedCard variant="gradient" hover className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ort. İlerleme</p>
                <p className="text-2xl md:text-3xl font-bold">{stats.avgProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-purple-500 opacity-50" />
            </div>
          </EnhancedCard>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <EnhancedCard variant="glass" className="p-8 md:p-12 text-center">
            <Briefcase className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl md:text-2xl font-bold mb-2">Henüz Proje Yok</h3>
            <p className="text-muted-foreground">
              Danışmanınız size bir proje atadığında burada görünecektir.
            </p>
          </EnhancedCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project) => (
              <EnhancedCard
                key={project.id}
                variant="glass"
                hover
                glow
                className="p-4 md:p-6 cursor-pointer transition-all duration-300"
                onClick={() => handleProjectClick(project.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold mb-2 truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.status && statusConfig[project.status] && (
                    <Badge className={statusConfig[project.status].color}>
                      {statusConfig[project.status].label}
                    </Badge>
                  )}
                  {project.priority && priorityConfig[project.priority] && (
                    <Badge className={priorityConfig[project.priority].color}>
                      {priorityConfig[project.priority].label}
                    </Badge>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">İlerleme</span>
                    <span className="font-semibold">{project.progress ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-1000"
                      style={{ width: `${project.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                  {project.consultant && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                        {project.consultant.full_name.charAt(0)}
                      </div>
                      <span className="truncate">{project.consultant.full_name}</span>
                    </div>
                  )}
                  {project.end_date && (
                    <span className="text-xs">
                      {new Date(project.end_date).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </EnhancedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
