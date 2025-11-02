'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, Copy, Trash2, AlertCircle, FolderOpen, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { ModernStatCard } from '@/presentation/components/ui/atoms/modern-stat-card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';

interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  _count?: {
    sub_projects: number;
  };
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'bg-gray-400' },
  medium: { label: 'Orta', color: 'bg-blue-400' },
  high: { label: 'Yüksek', color: 'bg-orange-400' },
  urgent: { label: 'Acil', color: 'bg-red-500' },
  critical: { label: 'Kritik', color: 'bg-red-600' },
};

export default function ProjectTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ProjectTemplate | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [templateDetails, setTemplateDetails] = useState<any>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Bu şablonu silmek istediğinizden emin misiniz?')) return;

    setDeletingId(templateId);
    try {
      const response = await fetch(`/api/projects/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete template');
      }

      await fetchTemplates();
      alert('Şablon başarıyla silindi!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = async (templateId: string) => {
    setPreviewLoading(true);
    try {
      // Fetch template details
      const templateResponse = await fetch(`/api/projects/templates/${templateId}`);
      if (!templateResponse.ok) throw new Error('Failed to fetch template details');
      const templateData = await templateResponse.json();
      const template = templateData.template;

      // Fetch sub-projects
      const subProjectsResponse = await fetch(`/api/sub-projects?projectId=${templateId}`);
      let subProjects: any[] = [];
      if (subProjectsResponse.ok) {
        const subProjectsData = await subProjectsResponse.json();
        subProjects = Array.isArray(subProjectsData) ? subProjectsData : [];
      }

      // Fetch tasks for each sub-project
      const subProjectsWithTasks = await Promise.all(
        subProjects.map(async (subProject) => {
          const tasksResponse = await fetch(`/api/tasks?subProjectId=${subProject.id}`);
          let tasks: any[] = [];
          if (tasksResponse.ok) {
            const tasksData = await tasksResponse.json();
            tasks = Array.isArray(tasksData) ? tasksData : tasksData.tasks || [];
          }
          return { ...subProject, tasks };
        })
      );

      setTemplateDetails({
        ...template,
        subProjects: subProjectsWithTasks,
      });
      setPreviewTemplate(templates.find((t) => t.id === templateId) || null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      const newName = prompt('Yeni şablon adı:', `${template.name} (Kopya)`);
      if (!newName || !newName.trim()) return;

      const response = await fetch('/api/projects/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          name: newName.trim(),
          is_template: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to duplicate template');
      }

      await fetchTemplates();
      toast.success('Şablon başarıyla kopyalandı!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
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
            <Button onClick={fetchTemplates}>Tekrar Dene</Button>
          </EnhancedCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <GradientHeader
          title="Proje Şablonları"
          subtitle={`${templates.length} şablon • Yeni projeler için hazır şablonlar oluşturun`}
          icon={Sparkles}
          actions={
            <Button
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => router.push('/dashboard/project-templates/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Şablon
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <ModernStatCard
            title="Toplam Şablon"
            value={templates.length}
            icon={Sparkles}
            color="purple"
            showGlow
          />
          <ModernStatCard
            title="Bu Ay Oluşturulan"
            value={
              templates.filter(
                (t) =>
                  new Date(t.created_at).getMonth() === new Date().getMonth() &&
                  new Date(t.created_at).getFullYear() === new Date().getFullYear()
              ).length
            }
            icon={Plus}
            color="blue"
          />
          <ModernStatCard
            title="Yüksek Öncelik"
            value={templates.filter((t) => t.priority === 'high' || t.priority === 'urgent').length}
            icon={AlertCircle}
            color="orange"
          />
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <EnhancedCard variant="glass" className="p-8 md:p-12 text-center">
            <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl md:text-2xl font-bold mb-2">Henüz Şablon Yok</h3>
            <p className="text-muted-foreground mb-6">
              Yeni projeler için tekrar kullanılabilir şablonlar oluşturun.
            </p>
            <Button onClick={() => router.push('/dashboard/project-templates/new')}>
              <Plus className="w-4 h-4 mr-2" />
              İlk Şablonu Oluştur
            </Button>
          </EnhancedCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {templates.map((template) => (
              <EnhancedCard
                key={template.id}
                variant="glass"
                hover
                glow
                className="p-6 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <h3 className="text-lg md:text-xl font-bold truncate">{template.name}</h3>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-purple-500">Şablon</Badge>
                  {priorityConfig[template.priority] ? (
                    <Badge className={priorityConfig[template.priority].color}>
                      {priorityConfig[template.priority].label}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-400">{template.priority || 'Orta'}</Badge>
                  )}
                </div>

                {/* Info */}
                <div className="mb-4 pb-4 border-b border-border">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      {template._count?.sub_projects || 0} Alt Proje
                    </span>
                    <span className="text-xs">
                      {new Date(template.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:flex-1"
                        onClick={() => handlePreview(template.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Önizle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{previewTemplate?.name || 'Şablon Önizleme'}</DialogTitle>
                        <DialogDescription>
                          {previewTemplate?.description || 'Şablon detayları'}
                        </DialogDescription>
                      </DialogHeader>
                      {previewLoading ? (
                        <div className="p-8 text-center">
                          <p className="text-muted-foreground">Yükleniyor...</p>
                        </div>
                      ) : templateDetails ? (
                        <div className="space-y-6">
                          {/* Template Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                                Öncelik
                              </h3>
                              <Badge className={priorityConfig[templateDetails.priority]?.color}>
                                {priorityConfig[templateDetails.priority]?.label}
                              </Badge>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                                Durum
                              </h3>
                              <Badge>{templateDetails.status || 'planning'}</Badge>
                            </div>
                          </div>

                          {templateDetails.description && (
                            <div>
                              <h3 className="font-semibold mb-2">Açıklama</h3>
                              <p className="text-sm text-muted-foreground">
                                {templateDetails.description}
                              </p>
                            </div>
                          )}

                          {/* Sub-Projects with Tasks */}
                          {templateDetails.subProjects && templateDetails.subProjects.length > 0 ? (
                            <div>
                              <h3 className="font-semibold mb-3">
                                Alt Projeler ({templateDetails.subProjects.length})
                              </h3>
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {templateDetails.subProjects.map((sp: any) => (
                                  <div
                                    key={sp.id}
                                    className="p-4 border rounded-lg bg-muted/50 space-y-3"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                                        <p className="font-medium">{sp.name}</p>
                                        <Badge variant="outline" className="text-xs">
                                          {sp.status || 'todo'}
                                        </Badge>
                                      </div>
                                      {sp.description && (
                                        <p className="text-sm text-muted-foreground ml-6">
                                          {sp.description}
                                        </p>
                                      )}
                                    </div>
                                    {sp.tasks && sp.tasks.length > 0 && (
                                      <div className="ml-6 space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">
                                          Görevler ({sp.tasks.length}):
                                        </p>
                                        {sp.tasks.map((task: any) => (
                                          <div
                                            key={task.id}
                                            className="pl-3 border-l-2 border-primary/20 text-sm"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">{task.title}</span>
                                              <Badge variant="outline" className="text-xs">
                                                {task.status || 'todo'}
                                              </Badge>
                                            </div>
                                            {task.description && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {task.description}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 border rounded-lg bg-muted/50 text-center">
                              <p className="text-sm text-muted-foreground">
                                Bu şablonda henüz alt proje veya görev yok.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1"
                    onClick={() => router.push(`/dashboard/project-templates/${template.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleDuplicate(template.id)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Kopyala
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-red-500/50 text-red-600 hover:bg-red-500/10"
                    onClick={() => handleDelete(template.id)}
                    disabled={deletingId === template.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </EnhancedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
