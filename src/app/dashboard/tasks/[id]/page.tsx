'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { TaskComments } from '@/1-presentation/components/features/tasks/TaskComments';
import { TaskDependencies } from '@/1-presentation/components/features/tasks/TaskDependencies';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/1-presentation/components/ui/atoms/tabs';
import { toast } from 'sonner';

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

export default function AdminTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      const data = await response.json();
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Görev yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

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
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Görev Bulunamadı
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Görev yüklenemedi'}</p>
            <Button onClick={() => router.back()} className="shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[task.status] || statusConfig.todo;
  const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
              {task.sub_project?.project && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.sub_project.project.name} &gt; {task.sub_project.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${statusInfo.color} text-white border-0`}>{statusInfo.label}</Badge>
            <Badge className={`${priorityInfo.color} text-white border-0`}>
              {priorityInfo.label}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800 p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-900 rounded-none border-b-0">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none"
                >
                  Detaylar
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none"
                >
                  Yorumlar
                </TabsTrigger>
                <TabsTrigger
                  value="dependencies"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none"
                >
                  Bağımlılıklar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="details" className="mt-0 p-6 space-y-6">
                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Açıklama
                    </h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {task.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Task Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Durum
                    </h3>
                    <Badge className={`${statusInfo.color} text-white border-0`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Öncelik
                    </h3>
                    <Badge className={`${priorityInfo.color} text-white border-0`}>
                      {priorityInfo.label}
                    </Badge>
                  </div>
                  {task.due_date && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Bitiş Tarihi
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(task.due_date).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {task.completed_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Tamamlanma Tarihi
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(task.completed_at).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {task.approved_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Onaylanma Tarihi
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(task.approved_at).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-0 p-6">
                <TaskComments taskId={taskId} />
              </TabsContent>

              <TabsContent value="dependencies" className="mt-0 p-6">
                {(() => {
                  const projectId = task?.sub_project?.project?.id;
                  if (projectId) {
                    return <TaskDependencies taskId={taskId} projectId={projectId} />;
                  }
                  return (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                      Proje bilgisi bulunamadı. Bağımlılıkları görüntülemek için görev bir projeye
                      ait olmalıdır.
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
