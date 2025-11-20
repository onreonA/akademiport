'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { TaskComments } from '@/1-presentation/components/features/tasks/TaskComments';
import { TaskDependencies } from '@/1-presentation/components/features/tasks/TaskDependencies';
import { useAuth } from '@/5-shared/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';

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

  const fetchTask = useCallback(async () => {
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
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <div className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Görev Bulunamadı
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Görev yüklenemedi'}</p>
            <Button onClick={() => router.push('/company-dashboard')} className="shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[task.status].icon;
  const canComplete = task.status === 'todo' || task.status === 'in_progress';
  const isCompleted = task.status === 'done';
  const isInReview = task.status === 'review';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/company-dashboard')}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {task.title}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              {task.sub_project?.project?.name || 'Görev Detayı'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                className={`${statusConfig[task.status].color} text-white border-0 flex items-center gap-2`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusConfig[task.status].label}
              </Badge>
              <Badge className={`${priorityConfig[task.priority].color} text-white border-0`}>
                {priorityConfig[task.priority].label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Task Info */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    Açıklama
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task.due_date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bitiş Tarihi</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      {new Date(task.due_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
                {task.completed_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tamamlanma Tarihi
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      {new Date(task.completed_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Project & Sub-Project */}
              {task.sub_project && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proje / Alt Proje</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {task.sub_project.project?.name} / {task.sub_project.name}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                {canComplete && (
                  <Button
                    onClick={handleCompleteTask}
                    disabled={submitting}
                    className="w-full sm:flex-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {submitting ? 'İşleniyor...' : 'Görevi Tamamla'}
                  </Button>
                )}
                {isInReview && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Göreviniz danışmanınız tarafından inceleniyor...
                    </p>
                  </div>
                )}
                {isCompleted && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Görev tamamlandı ve onaylandı!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dependencies Section */}
        {task.sub_project?.project?.id && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Bağımlılıklar</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <TaskDependencies taskId={taskId} projectId={task.sub_project.project.id} />
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        {user && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Yorumlar & Sorular</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <TaskComments taskId={taskId} currentUserId={user.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
