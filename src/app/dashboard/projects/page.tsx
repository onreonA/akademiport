'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderKanban, Search, Filter, Eye } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Badge } from '@/presentation/components/ui/atoms/badge';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  companyName?: string;
  consultantName?: string;
  createdAt: string;
}

export default function AdminProjectsPage() {
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <GradientHeader
        title="Tüm Projeler"
        description="Sistemdeki tüm projeleri görüntüleyin ve yönetin"
        icon={FolderKanban}
        actions={
          <Button onClick={() => router.push('/dashboard/projects/deleted')} variant="outline">
            Silinen Projeler
          </Button>
        }
      />

      {/* Filters */}
      <EnhancedCard variant="glass" className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Proje ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="planning">Planlama</option>
              <option value="active">Aktif</option>
              <option value="on_hold">Beklemede</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
        </div>
      </EnhancedCard>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <EnhancedCard variant="glass" className="p-12 text-center">
          <FolderKanban className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Proje Bulunamadı</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Arama kriterlerinize uygun proje bulunamadı.'
              : 'Henüz proje bulunmuyor.'}
          </p>
        </EnhancedCard>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <EnhancedCard key={project.id} variant="glass" className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <Badge className={getPriorityColor(project.priority)}>
                      {getPriorityLabel(project.priority)}
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    {project.companyName && <span>Firma: {project.companyName}</span>}
                    {project.consultantName && <span>Danışman: {project.consultantName}</span>}
                    <span>
                      Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">İlerleme</span>
                      <span className="text-sm font-medium">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Detay
                  </Button>
                </div>
              </div>
            </EnhancedCard>
          ))}
        </div>
      )}
    </div>
  );
}
