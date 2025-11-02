'use client';

import { useState, useEffect } from 'react';
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
import { GradientHeader } from '@/1-presentation/components/ui/molecules/gradient-header';
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

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
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
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Görev yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error fetching company users:', error);
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
      console.error('Error updating task:', error);
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
      console.error('Error deleting task:', error);
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <GradientHeader
          title="Görev Düzenle"
          subtitle={task.title}
          icon={Save}
          actions={
            <Link href="/consultant-dashboard/tasks/review">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
          }
        />

        {/* Status Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EnhancedCard className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Durum</p>
              <p className="text-lg font-bold text-blue-600">
                {task.status === 'todo' && 'Yapılacak'}
                {task.status === 'in_progress' && 'Devam Ediyor'}
                {task.status === 'review' && 'İncelemede'}
                {task.status === 'done' && 'Tamamlandı'}
                {task.status === 'cancelled' && 'İptal'}
              </p>
            </div>
          </EnhancedCard>

          <EnhancedCard className="bg-linear-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Öncelik</p>
              <p className="text-lg font-bold text-purple-600">
                {task.priority === 'low' && 'Düşük'}
                {task.priority === 'medium' && 'Orta'}
                {task.priority === 'high' && 'Yüksek'}
                {task.priority === 'critical' && 'Kritik'}
              </p>
            </div>
          </EnhancedCard>

          <EnhancedCard className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Oluşturulma</p>
              <p className="text-lg font-bold text-green-600">
                {new Date(task.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </EnhancedCard>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="dependencies">Bağımlılıklar</TabsTrigger>
            <TabsTrigger value="comments">Yorumlar</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Form */}
            <EnhancedCard>
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
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={saving || deleting || !formData.title}
                    className="flex-1"
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
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </EnhancedCard>

            {/* Approval Status */}
            {task.completedAt && (
              <EnhancedCard className="bg-green-50/50 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Görev Tamamlandı</h3>
                    <p className="text-sm text-green-700">
                      {new Date(task.completedAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              </EnhancedCard>
            )}
          </TabsContent>

          <TabsContent value="dependencies" className="space-y-6">
            {projectId ? (
              <TaskDependencies taskId={taskId} projectId={projectId} />
            ) : (
              <EnhancedCard variant="glass" className="p-6">
                <p className="text-muted-foreground">Proje bilgisi yükleniyor...</p>
              </EnhancedCard>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            {user && (
              <EnhancedCard className="border-blue-200 bg-blue-50/50">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Yorumlar ve Sorular</h3>
                  <TaskComments taskId={taskId} currentUserId={user.id} />
                </div>
              </EnhancedCard>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Section */}
        <EnhancedCard className="border-red-200 bg-red-50/50">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-900">Tehlikeli Bölge</h3>
              <p className="text-sm text-red-700 mt-1">
                Görevi silerseniz, bu işlem geri alınamaz. Tüm yorumlar da silinecektir.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={saving || deleting}
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
