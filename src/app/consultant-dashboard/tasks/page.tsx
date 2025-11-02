/**
 * Consultant Tasks Page
 *
 * Ana görev listesi sayfası - Consultant için
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListTodo, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { ModernStatCard } from '@/presentation/components/ui/atoms/modern-stat-card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';

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

const statusConfig = {
  todo: { label: 'Yapılacak', color: 'bg-gray-400' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-blue-400' },
  review: { label: 'İncelemede', color: 'bg-yellow-400' },
  done: { label: 'Tamamlandı', color: 'bg-green-400' },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-400' },
};

function ConsultantTasksPageContent() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'all';
    }
    return 'all';
  });
  // Stats için ayrı bir state
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const fetchAllTasks = async () => {
    try {
      const response = await fetch('/api/consultant/tasks');
      if (response.ok) {
        const data = await response.json();
        setAllTasks(data.tasks || []);
      }
    } catch (err) {
      // Ignore errors for stats
    }
  };

  useEffect(() => {
    // URL'den tab parametresini oku
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'all';
      if (tab !== activeTab) {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchAllTasks(); // Stats için de güncelle
  }, [activeTab]);

  useEffect(() => {
    // Stats için tüm görevleri getir (sadece component mount olduğunda)
    fetchAllTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      // Consultant'ın projelerindeki tüm görevleri getir
      // Tab'a göre durum filtresi ekle
      let url = '/api/consultant/tasks';
      if (activeTab === 'pending') {
        url += '?status=review';
      } else if (activeTab === 'in_progress') {
        url += '?status=in_progress';
      } else if (activeTab === 'completed') {
        url += '?status=done';
      }
      // activeTab === 'all' ise filter yok, tüm görevler gelir

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();

      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: allTasks.length,
    pending: allTasks.filter((t) => t.status === 'review').length,
    inProgress: allTasks.filter((t) => t.status === 'in_progress').length,
    completed: allTasks.filter((t) => t.status === 'done').length,
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

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <GradientHeader
          title="Görevler"
          subtitle="Projelerinizdeki görevleri görüntüleyin ve yönetin"
          icon={ListTodo}
          actions={
            <Button onClick={() => router.push('/consultant-dashboard/tasks/review')}>
              Onay Bekleyen Görevler ({stats.pending})
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <ModernStatCard
            title="Toplam Görev"
            value={stats.total}
            icon={ListTodo}
            color="blue"
            showGlow
          />
          <ModernStatCard
            title="Onay Bekleyen"
            value={stats.pending}
            icon={Clock}
            color="orange"
            showGlow={stats.pending > 0}
          />
          <ModernStatCard
            title="Devam Eden"
            value={stats.inProgress}
            icon={AlertCircle}
            color="purple"
          />
          <ModernStatCard
            title="Tamamlanan"
            value={stats.completed}
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tümü ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Onay Bekleyen ({stats.pending})</TabsTrigger>
            <TabsTrigger value="in_progress">Devam Eden ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan ({stats.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {tasks.length === 0 ? (
              <EnhancedCard variant="glass" className="p-8 md:p-12 text-center">
                <ListTodo className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">Görev Bulunamadı</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending'
                    ? 'Şu anda onay bekleyen görev bulunmamaktadır.'
                    : 'Bu durumda görev bulunmamaktadır.'}
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
                      <Badge
                        className={
                          statusConfig[task.status as keyof typeof statusConfig]?.color ||
                          'bg-gray-400'
                        }
                      >
                        {statusConfig[task.status as keyof typeof statusConfig]?.label ||
                          task.status}
                      </Badge>
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
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/consultant-dashboard/tasks/${task.id}/edit`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detaylar
                      </Button>
                      {task.status === 'review' && (
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            router.push('/consultant-dashboard/tasks/review');
                            // Sayfayı yenile ki görevler güncellensin
                            setTimeout(() => window.location.reload(), 500);
                          }}
                        >
                          Onayla
                        </Button>
                      )}
                    </div>
                  </EnhancedCard>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ConsultantTasksPage() {
  return <ConsultantTasksPageContent />;
}
