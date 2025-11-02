'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ListTodo, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { TaskComments } from '@/1-presentation/components/features/tasks/TaskComments';
import { TaskDependencies } from '@/1-presentation/components/features/tasks/TaskDependencies';
import { useAuth } from '@/5-shared/hooks/useAuth';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  approved_at?: string;
  sub_project?: {
    id: string;
    name: string;
    project?: {
      id: string;
      name: string;
    };
  };
}

const statusConfig = {
  todo: { label: 'Yapılacak', color: 'bg-gray-500', icon: Clock },
  in_progress: { label: 'Devam Ediyor', color: 'bg-blue-500', icon: Clock },
  review: { label: 'İncelemede', color: 'bg-yellow-500', icon: AlertCircle },
  done: { label: 'Tamamlandı', color: 'bg-green-500', icon: CheckCircle2 },
  cancelled: { label: 'İptal', color: 'bg-red-500', icon: AlertCircle },
};

const priorityConfig = {
  low: { label: 'Düşük', color: 'bg-gray-400' },
  medium: { label: 'Orta', color: 'bg-blue-400' },
  high: { label: 'Yüksek', color: 'bg-orange-400' },
  urgent: { label: 'Acil', color: 'bg-red-500' },
};

export default function CompanyTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      const data = await response.json();
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!confirm('Görevi tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete task');
      }

      await fetchTask();
      alert('Görev başarıyla tamamlandı ve danışmanınıza gönderildi!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-32 bg-muted animate-pulse rounded-2xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <EnhancedCard variant="neon" className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Görev Bulunamadı</h2>
            <p className="text-muted-foreground mb-4">{error || 'Görev yüklenemedi'}</p>
            <Button onClick={() => router.push('/company-dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </EnhancedCard>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[task.status].icon;
  const canComplete = task.status === 'todo' || task.status === 'in_progress';
  const isCompleted = task.status === 'done';
  const isInReview = task.status === 'review';

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <GradientHeader
          title={task.title}
          subtitle={task.sub_project?.project?.name || 'Görev Detayı'}
          icon={ListTodo}
          actions={
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => router.push('/company-dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          }
        />

        {/* Task Info */}
        <EnhancedCard variant="glass" className="p-6 md:p-8">
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="flex flex-wrap gap-3">
              <Badge className={`${statusConfig[task.status].color} flex items-center gap-2`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig[task.status].label}
              </Badge>
              <Badge className={priorityConfig[task.priority].color}>
                {priorityConfig[task.priority].label}
              </Badge>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Açıklama</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {task.due_date && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bitiş Tarihi</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(task.due_date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
              {task.completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tamamlanma Tarihi</p>
                  <p className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {new Date(task.completed_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
            </div>

            {/* Project & Sub-Project */}
            {task.sub_project && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Proje / Alt Proje</p>
                <p className="font-medium">
                  {task.sub_project.project?.name} / {task.sub_project.name}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              {canComplete && (
                <Button
                  onClick={handleCompleteTask}
                  disabled={submitting}
                  className="w-full sm:flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {submitting ? 'İşleniyor...' : 'Görevi Tamamla'}
                </Button>
              )}
              {isInReview && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Göreviniz danışmanınız tarafından inceleniyor...
                  </p>
                </div>
              )}
              {isCompleted && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Görev tamamlandı ve onaylandı!
                  </p>
                </div>
              )}
            </div>
          </div>
        </EnhancedCard>

        {/* Dependencies Section */}
        {task.sub_project?.project?.id && (
          <EnhancedCard variant="glass" className="p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6">Bağımlılıklar</h3>
            <TaskDependencies taskId={taskId} projectId={task.sub_project.project.id} />
          </EnhancedCard>
        )}

        {/* Comments Section */}
        {user && (
          <EnhancedCard variant="glass" className="p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6">Yorumlar & Sorular</h3>
            <TaskComments taskId={taskId} currentUserId={user.id} />
          </EnhancedCard>
        )}
      </div>
    </div>
  );
}
