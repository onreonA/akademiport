'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Input } from '@/1-presentation/components/ui/atoms/input';
import { Label } from '@/1-presentation/components/ui/atoms/label';
import { Textarea } from '@/1-presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/1-presentation/components/ui/atoms/select';
import { EnhancedCard } from '@/1-presentation/components/ui/atoms/enhanced-card';
import { ArrowLeft, Save, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TaskComments } from '@/1-presentation/components/features/tasks/TaskComments';
import { TaskDependencies } from '@/1-presentation/components/features/tasks/TaskDependencies';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/1-presentation/components/ui/atoms/tabs';
import { useAuth } from '@/5-shared/hooks/useAuth';

interface Task {
  id: string;
  subProjectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  dueDate: string | null;
  completedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  subProject?: {
    projectId: string;
    project?: {
      companyId: string;
    };
  };
}

interface User {
  id: string;
  email: string;
  fullName: string;
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    orderIndex: 0,
  });

  const fetchTask = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');

      const data = await response.json();
      setTask(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        assignedTo: data.assignedTo || '',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
        orderIndex: data.orderIndex,
      });

      // Fetch company users after getting task
      if (data.subProjectId) {
        await fetchCompanyUsers(data.subProjectId);
      }
    } catch {
      toast.error('Görev yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [taskId, fetchCompanyUsers]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId, fetchTask]);

  const fetchCompanyUsers = async (subProjectId: string) => {
    try {
      // Get sub-project to find project
      const subProjectResponse = await fetch(`/api/sub-projects/${subProjectId}`);
      if (!subProjectResponse.ok) throw new Error('Failed to fetch sub-project');
      const subProjectData = await subProjectResponse.json();

      // Get project to find company
      const projectResponse = await fetch(`/api/projects/${subProjectData.projectId}`);
      if (!projectResponse.ok) throw new Error('Failed to fetch project');
      const projectData = await projectResponse.json();

      // Set projectId for dependencies
      setProjectId(subProjectData.projectId);

      // Fetch company users
      if (projectData.companyId) {
        const usersResponse = await fetch(`/api/companies/${projectData.companyId}/users`);
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users || []);
        }
      }
    } catch {
      // Fallback to all users if company users fetch fails
      fetchAllUsers();
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // If status is being changed to 'in_progress', check dependencies first
      if (formData.status === 'in_progress' && task?.status !== 'in_progress') {
        const checkResponse = await fetch(`/api/tasks/${taskId}/dependencies/check`);
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (!checkData.allComplete && checkData.incompleteDependencies.length > 0) {
            toast.error(
              `Bu görevi başlatmak için ${checkData.incompleteDependencies.length} bağımlı görevin tamamlanması gerekiyor. Lütfen önce bağımlı görevleri tamamlayın.`,
              { duration: 5000 }
            );
            setSaving(false);
            return;
          }
        }
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
          assignedTo:
            formData.assignedTo === 'none' || formData.assignedTo === ''
              ? null
              : formData.assignedTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }

      toast.success('Görev başarıyla güncellendi!');
      router.push('/consultant-dashboard/tasks/review');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      toast.success('Görev başarıyla silindi!');
      router.push('/consultant-dashboard/tasks/review');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Görev yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Görev bulunamadı</p>
          <Link href="/consultant-dashboard/tasks/review">
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      todo: { label: 'Yapılacak', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      in_progress: { label: 'Devam Ediyor', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      review: { label: 'İncelemede', color: 'text-purple-700', bgColor: 'bg-purple-100' },
      done: { label: 'Tamamlandı', color: 'text-green-700', bgColor: 'bg-green-100' },
      cancelled: { label: 'İptal', color: 'text-red-700', bgColor: 'bg-red-100' },
    };
    return statusMap[status] || statusMap.todo;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; color: string; bgColor: string }> = {
      low: { label: 'Düşük', color: 'text-gray-700', bgColor: 'bg-gray-100' },
      medium: { label: 'Orta', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      high: { label: 'Yüksek', color: 'text-orange-700', bgColor: 'bg-orange-100' },
      critical: { label: 'Kritik', color: 'text-red-700', bgColor: 'bg-red-100' },
    };
    return priorityMap[priority] || priorityMap.medium;
  };

  const statusBadge = getStatusBadge(task.status);
  const priorityBadge = getPriorityBadge(task.priority);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/consultant-dashboard/tasks/review">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </Button>
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h1>
                <p className="text-muted-foreground">Görev bilgilerini düzenleyin</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.bgColor} ${statusBadge.color}`}
                >
                  {statusBadge.label}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${priorityBadge.bgColor} ${priorityBadge.color}`}
                >
                  {priorityBadge.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <EnhancedCard className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Durum</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {statusBadge.label}
                </p>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Öncelik</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {priorityBadge.label}
                </p>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Oluşturulma</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(task.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </EnhancedCard>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
            >
              Genel Bilgiler
            </TabsTrigger>
            <TabsTrigger
              value="dependencies"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
            >
              Bağımlılıklar
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
            >
              Yorumlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-6">
            {/* Form */}
            <EnhancedCard className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Görev Bilgileri
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Görev Başlığı <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Örn: Analiz raporunu hazırla"
                      required
                      disabled={saving || deleting}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Görev hakkında detaylı açıklama..."
                      rows={4}
                      disabled={saving || deleting}
                    />
                  </div>

                  {/* Status & Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Durum</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                        disabled={saving || deleting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Yapılacak</SelectItem>
                          <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                          <SelectItem value="review">İncelemede</SelectItem>
                          <SelectItem value="done">Tamamlandı</SelectItem>
                          <SelectItem value="cancelled">İptal Edildi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Öncelik</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        disabled={saving || deleting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Öncelik seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Düşük</SelectItem>
                          <SelectItem value="medium">Orta</SelectItem>
                          <SelectItem value="high">Yüksek</SelectItem>
                          <SelectItem value="critical">Kritik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Assigned To & Due Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Atanan Kişi</Label>
                      <Select
                        value={formData.assignedTo || 'none'}
                        onValueChange={(value) =>
                          setFormData({ ...formData, assignedTo: value === 'none' ? '' : value })
                        }
                        disabled={saving || deleting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kullanıcı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Atanmamış</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.fullName || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Bitiş Tarihi</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        disabled={saving || deleting}
                      />
                    </div>
                  </div>

                  {/* Order Index */}
                  <div className="space-y-2">
                    <Label htmlFor="orderIndex">Sıra</Label>
                    <Input
                      id="orderIndex"
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          orderIndex: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      disabled={saving || deleting}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      type="submit"
                      disabled={saving || deleting || !formData.title}
                      className="flex-1 sm:flex-none sm:min-w-[200px]"
                      size="lg"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Değişiklikleri Kaydet
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/consultant-dashboard/tasks/review')}
                      disabled={saving || deleting}
                      size="lg"
                      className="flex-1 sm:flex-none"
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              </div>
            </EnhancedCard>

            {/* Approval Status */}
            {task.completedAt && (
              <EnhancedCard className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Görev Tamamlandı
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {new Date(task.completedAt).toLocaleString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            )}
          </TabsContent>

          <TabsContent value="dependencies" className="mt-6">
            {projectId ? (
              <TaskDependencies taskId={taskId} projectId={projectId} />
            ) : (
              <EnhancedCard className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Proje bilgisi yükleniyor...</p>
                </div>
              </EnhancedCard>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            {user && (
              <EnhancedCard className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                    Yorumlar ve Sorular
                  </h3>
                  <TaskComments taskId={taskId} currentUserId={user.id} />
                </div>
              </EnhancedCard>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Section */}
        <EnhancedCard className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 mt-6">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Tehlikeli Bölge
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Görevi silerseniz, bu işlem geri alınamaz. Tüm yorumlar da silinecektir.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={saving || deleting}
              size="lg"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Görevi Sil
                </>
              )}
            </Button>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
