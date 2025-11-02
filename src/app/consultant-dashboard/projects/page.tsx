'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderKanban, Search, Filter } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  companyName?: string;
  createdAt: string;
}

export default function ConsultantProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/projects?${params}`);
      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      // API returns { projects: [...], total, page, limit }
      setProjects(data.projects || data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      on_hold: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      completed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planning: 'Planlama',
      active: 'Aktif',
      on_hold: 'Beklemede',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-500/10 text-gray-500',
      medium: 'bg-blue-500/10 text-blue-500',
      high: 'bg-orange-500/10 text-orange-500',
      critical: 'bg-red-500/10 text-red-500',
    };
    return colors[priority] || 'bg-gray-500/10 text-gray-500';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      critical: 'Kritik',
    };
    return labels[priority] || priority;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <GradientHeader
          icon={FolderKanban}
          title="Projelerim"
          subtitle={`${filteredProjects.length} proje bulundu`}
          progress={0}
          actions={
            <Button
              onClick={() => router.push('/consultant-dashboard/projects/new')}
              className="bg-linear-to-r from-primary to-secondary hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Proje
            </Button>
          }
        />

        {/* Filters */}
        <EnhancedCard variant="glass" className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Proje ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="planning">Planlama</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="on_hold">Beklemede</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </EnhancedCard>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <EnhancedCard key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <EnhancedCard variant="glass" className="p-12 text-center">
            <FolderKanban className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Henüz Proje Yok</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Yeni bir proje oluşturarak başlayın
            </p>
            <Button
              onClick={() => router.push('/consultant-dashboard/projects/new')}
              className="bg-linear-to-r from-primary to-secondary hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              İlk Projeyi Oluştur
            </Button>
          </EnhancedCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <EnhancedCard
                key={project.id}
                variant="glass"
                hover
                className="group cursor-pointer p-6 transition-all"
                onClick={() => router.push(`/consultant-dashboard/projects/${project.id}`)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold group-hover:text-primary">{project.name}</h3>
                    {project.companyName && (
                      <p className="text-xs text-muted-foreground">{project.companyName}</p>
                    )}
                  </div>
                  <Badge className={getPriorityColor(project.priority)}>
                    {getPriorityLabel(project.priority)}
                  </Badge>
                </div>

                {project.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                )}

                <div className="mb-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">İlerleme</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-linear-to-r from-primary to-secondary transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </EnhancedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
