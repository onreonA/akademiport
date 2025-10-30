'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { ModernStatCard } from '@/presentation/components/ui/atoms/modern-stat-card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  completed_at?: string;
  sub_project?: {
    id: string;
    name: string;
    project?: {
      id: string;
      name: string;
      company?: {
        id: string;
        name: string;
      };
    };
  };
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

const priorityConfig = {
  low: { label: 'Düşük', color: 'bg-gray-400' },
  medium: { label: 'Orta', color: 'bg-blue-400' },
  high: { label: 'Yüksek', color: 'bg-orange-400' },
  urgent: { label: 'Acil', color: 'bg-red-500' },
};

export default function ConsultantTaskReviewPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Fetch tasks with status 'review'
      const response = await fetch('/api/tasks?status=review');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    if (!confirm('Bu görevi onaylamak istediğinizden emin misiniz?')) return;

    setProcessingTaskId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve task');
      }

      await fetchTasks();
      alert('Görev başarıyla onaylandı!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingTaskId(null);
    }
  };

  const handleReject = async (taskId: string) => {
    const reason = prompt('Reddetme sebebini yazın (opsiyonel):');
    if (reason === null) return; // User cancelled

    setProcessingTaskId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject task');
      }

      await fetchTasks();
      alert('Görev reddedildi ve firma kullanıcısına geri gönderildi.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingTaskId(null);
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
            <Button onClick={fetchTasks}>Tekrar Dene</Button>
          </EnhancedCard>
        </div>
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <GradientHeader
          title="Görev Onaylama"
          subtitle={`${stats.total} görev inceleme bekliyor`}
          icon={ListTodo}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <ModernStatCard
            title="Toplam Görev"
            value={stats.total}
            icon={Clock}
            color="blue"
            showGlow
          />
          <ModernStatCard
            title="Acil Öncelik"
            value={stats.urgent}
            icon={AlertCircle}
            color="pink"
            showGlow={stats.urgent > 0}
          />
          <ModernStatCard
            title="Yüksek Öncelik"
            value={stats.high}
            icon={AlertCircle}
            color="orange"
          />
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <EnhancedCard variant="glass" className="p-8 md:p-12 text-center">
            <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl md:text-2xl font-bold mb-2">Tüm Görevler İncelendi!</h3>
            <p className="text-muted-foreground">
              Şu anda inceleme bekleyen görev bulunmamaktadır.
            </p>
          </EnhancedCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {tasks.map((task) => (
              <EnhancedCard key={task.id} variant="glass" hover glow className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold mb-2 truncate">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-yellow-500">İncelemede</Badge>
                  <Badge
                    className={
                      priorityConfig[task.priority as keyof typeof priorityConfig]?.color ||
                      'bg-gray-400'
                    }
                  >
                    {priorityConfig[task.priority as keyof typeof priorityConfig]?.label ||
                      task.priority}
                  </Badge>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-4 pb-4 border-b border-border">
                  {task.sub_project?.project && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Proje</p>
                      <p className="text-sm font-medium">{task.sub_project.project.name}</p>
                      {task.sub_project.project.company && (
                        <p className="text-xs text-muted-foreground">
                          {task.sub_project.project.company.name}
                        </p>
                      )}
                    </div>
                  )}
                  {task.sub_project && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Alt Proje</p>
                      <p className="text-sm font-medium">{task.sub_project.name}</p>
                    </div>
                  )}
                  {task.assigned_user && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Atanan Kişi</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                          {task.assigned_user.full_name.charAt(0)}
                        </div>
                        <p className="text-sm font-medium">{task.assigned_user.full_name}</p>
                      </div>
                    </div>
                  )}
                  {task.completed_at && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tamamlanma Tarihi</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(task.completed_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 border-red-500/50 text-red-600 hover:bg-red-500/10"
                    onClick={() => handleReject(task.id)}
                    disabled={processingTaskId === task.id}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reddet
                  </Button>
                  <Button
                    className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(task.id)}
                    disabled={processingTaskId === task.id}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {processingTaskId === task.id ? 'İşleniyor...' : 'Onayla'}
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
