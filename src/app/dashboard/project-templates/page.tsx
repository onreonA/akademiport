'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { TemplateCard } from '@/presentation/components/features/projects/TemplateCard';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                Şablonlar yükleniyor...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Hata Oluştu
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <Button onClick={fetchTemplates}>Tekrar Dene</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Proje Şablonları
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              Yeni projeler için tekrar kullanılabilir şablonlar oluşturun
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {templates.length} şablon
              </div>
            </div>
          </div>
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/dashboard/project-templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Şablon
            </Link>
          </Button>
        </div>

        {/* Content */}
        {templates.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Henüz Şablon Yok
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Yeni projeler için tekrar kullanılabilir şablonlar oluşturun.
                </p>
                <Button asChild onClick={() => router.push('/dashboard/project-templates/new')}>
                  <Link href="/dashboard/project-templates/new">
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Şablonu Oluştur
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={(id) => router.push(`/dashboard/project-templates/${id}/edit`)}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onPreview={handlePreview}
                />
              ))}
            </div>

            {/* Preview Dialog */}
            <Dialog
              open={!!previewTemplate}
              onOpenChange={(open) => !open && setPreviewTemplate(null)}
            >
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">
                    {previewTemplate?.name || 'Şablon Önizleme'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    {previewTemplate?.description || 'Şablon detayları'}
                  </DialogDescription>
                </DialogHeader>
                {previewLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                  </div>
                ) : templateDetails ? (
                  <div className="space-y-6">
                    {/* Template Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">
                          Öncelik
                        </h3>
                        <Badge
                          className={
                            templateDetails.priority === 'low'
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                              : templateDetails.priority === 'medium'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : templateDetails.priority === 'high'
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                          }
                        >
                          {templateDetails.priority === 'low'
                            ? 'Düşük'
                            : templateDetails.priority === 'medium'
                              ? 'Orta'
                              : templateDetails.priority === 'high'
                                ? 'Yüksek'
                                : 'Acil'}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">
                          Durum
                        </h3>
                        <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          {templateDetails.status || 'planning'}
                        </Badge>
                      </div>
                    </div>

                    {templateDetails.description && (
                      <div>
                        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                          Açıklama
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {templateDetails.description}
                        </p>
                      </div>
                    )}

                    {/* Sub-Projects with Tasks */}
                    {templateDetails.subProjects && templateDetails.subProjects.length > 0 ? (
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                          Alt Projeler ({templateDetails.subProjects.length})
                        </h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {templateDetails.subProjects.map((sp: any) => (
                            <div
                              key={sp.id}
                              className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-3"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <FolderOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {sp.name}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-gray-200 dark:border-gray-800"
                                  >
                                    {sp.status || 'todo'}
                                  </Badge>
                                </div>
                                {sp.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                                    {sp.description}
                                  </p>
                                )}
                              </div>
                              {sp.tasks && sp.tasks.length > 0 && (
                                <div className="ml-6 space-y-2">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Görevler ({sp.tasks.length}):
                                  </p>
                                  {sp.tasks.map((task: any) => (
                                    <div
                                      key={task.id}
                                      className="pl-3 border-l-2 border-primary/20 text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {task.title}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-gray-200 dark:border-gray-800"
                                        >
                                          {task.status || 'todo'}
                                        </Badge>
                                      </div>
                                      {task.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
                      <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bu şablonda henüz alt proje veya görev yok.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
