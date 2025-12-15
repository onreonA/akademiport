'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  Link2Off,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { EnhancedCard } from '@/1-presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/1-presentation/components/ui/atoms/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/1-presentation/components/ui/atoms/dialog';
import { Label } from '@/1-presentation/components/ui/atoms/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/1-presentation/components/ui/atoms/tooltip';
import { toast } from 'sonner';

interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: 'blocks' | 'related';
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
}

interface TaskDependenciesProps {
  taskId: string;
  projectId: string;
}

export function TaskDependencies({ taskId, projectId }: TaskDependenciesProps) {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [dependents, setDependents] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDependency, setNewDependency] = useState({
    dependsOnTaskId: '',
    dependencyType: 'blocks' as 'blocks' | 'related',
  });
  const [submitting, setSubmitting] = useState(false);
  const [dependencyCheck, setDependencyCheck] = useState<{
    allComplete: boolean;
    incompleteDependencies: string[];
  } | null>(null);

  const fetchDependencies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}/dependencies`);
      if (!response.ok) throw new Error('Failed to fetch dependencies');

      const data = await response.json();
      setDependencies(data.dependencies || []);
      setDependents(data.dependents || []);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      toast.error('Bağımlılıklar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      console.warn('TaskDependencies: projectId is required but not provided');
      return;
    }

    try {
      const url = `/api/projects/${projectId}/tasks`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTasks(data.tasks || data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [projectId, taskId]);

  const checkDependencies = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/dependencies/check`);
      if (response.ok) {
        const data = await response.json();
        setDependencyCheck(data);
      }
    } catch (error) {
      console.error('Error checking dependencies:', error);
    }
  }, [taskId]);

  useEffect(() => {
    fetchDependencies();
    fetchTasks();
    checkDependencies();
  }, [fetchDependencies, fetchTasks, checkDependencies]);

  const handleAddDependency = async () => {
    if (!newDependency.dependsOnTaskId) {
      toast.error('Lütfen bir görev seçin.');
      return;
    }

    try {
      setSubmitting(true);

      // First validate
      const validateResponse = await fetch(`/api/tasks/${taskId}/dependencies/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependsOnTaskId: newDependency.dependsOnTaskId }),
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        throw new Error(errorData.error || 'Validation failed');
      }

      const validateData = await validateResponse.json();
      if (!validateData.isValid) {
        toast.error(validateData.message || 'Bu bağımlılık eklenemez.');
        return;
      }

      // Create dependency
      const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDependency),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create dependency');
      }

      toast.success('Bağımlılık başarıyla eklendi.');
      setOpenDialog(false);
      setNewDependency({ dependsOnTaskId: '', dependencyType: 'blocks' });
      fetchDependencies();
    } catch (error) {
      console.error('Error adding dependency:', error);
      toast.error(
        error instanceof Error ? error.message : 'Bağımlılık eklenirken bir hata oluştu.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDependency = async (dependencyId: string) => {
    if (!confirm('Bu bağımlılığı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/dependencies/${dependencyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete dependency');
      }

      toast.success('Bağımlılık başarıyla silindi.');
      fetchDependencies();
    } catch (error) {
      console.error('Error deleting dependency:', error);
      toast.error(
        error instanceof Error ? error.message : 'Bağımlılık silinirken bir hata oluştu.'
      );
    }
  };

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.title || 'Bilinmeyen Görev';
  };

  const getTaskStatus = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.status || 'unknown';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      todo: 'Yapılacak',
      in_progress: 'Devam Ediyor',
      review: 'İncelemede',
      done: 'Tamamlandı',
      cancelled: 'İptal',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <EnhancedCard variant="glass" className="p-6">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </EnhancedCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bağımlı Olduğu Görevler (Dependencies) */}
      <EnhancedCard variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Bağımlı Olduğu Görevler</h3>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Bağımlılık Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Bağımlılık Ekle</DialogTitle>
                <DialogDescription>Bu görevin bağımlı olacağı görevi seçin.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dependsOnTask">Bağımlı Olunan Görev</Label>
                  <Select
                    value={newDependency.dependsOnTaskId}
                    onValueChange={(value) =>
                      setNewDependency({ ...newDependency, dependsOnTaskId: value })
                    }
                  >
                    <SelectTrigger id="dependsOnTask">
                      <SelectValue placeholder="Görev seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks
                        .filter((t) => t.id !== taskId && t.status !== 'cancelled')
                        .map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dependencyType">Bağımlılık Tipi</Label>
                  <Select
                    value={newDependency.dependencyType}
                    onValueChange={(value: 'blocks' | 'related') =>
                      setNewDependency({ ...newDependency, dependencyType: value })
                    }
                  >
                    <SelectTrigger id="dependencyType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blocks">Zorunlu (Blocks)</SelectItem>
                      <SelectItem value="related">İlişkili (Related)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddDependency} disabled={submitting}>
                  {submitting ? 'Ekleniyor...' : 'Ekle'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {dependencies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Bu görev henüz başka görevlere bağımlı değil.
          </p>
        ) : (
          <div className="space-y-3">
            {dependencies.map((dependency) => {
              const dependsOnTaskStatus = getTaskStatus(dependency.dependsOnTaskId);
              const isComplete = dependsOnTaskStatus === 'done';
              const isBlocking = dependency.dependencyType === 'blocks';
              const isIncomplete = isBlocking && !isComplete;

              return (
                <div
                  key={dependency.id}
                  className={`flex items-center justify-between p-3 bg-background/50 rounded-lg border ${
                    isIncomplete ? 'border-yellow-500/50 bg-yellow-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Link2
                      className={`h-4 w-4 ${isIncomplete ? 'text-yellow-500' : 'text-muted-foreground'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getTaskTitle(dependency.dependsOnTaskId)}</p>
                        {getStatusIcon(dependsOnTaskStatus)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          variant={
                            dependency.dependencyType === 'blocks' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {dependency.dependencyType === 'blocks' ? 'Zorunlu' : 'İlişkili'}
                        </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant={isComplete ? 'default' : 'outline'}
                                className={`text-xs ${isComplete ? 'bg-green-500' : ''}`}
                              >
                                {getStatusLabel(dependsOnTaskStatus)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Bağımlı görevin durumu: {getStatusLabel(dependsOnTaskStatus)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {isIncomplete && (
                          <Badge
                            variant="outline"
                            className="text-xs text-yellow-600 border-yellow-500"
                          >
                            Bekleniyor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDependency(dependency.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </EnhancedCard>

      {/* Bu Göreve Bağımlı Olan Görevler (Dependents) */}
      {dependents.length > 0 && (
        <EnhancedCard variant="glass" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2Off className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Bu Göreve Bağımlı Olan Görevler</h3>
          </div>
          <div className="space-y-3">
            {dependents.map((dependent) => (
              <div
                key={dependent.id}
                className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border"
              >
                <Link2Off className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{getTaskTitle(dependent.taskId)}</p>
                  <Badge
                    variant={dependent.dependencyType === 'blocks' ? 'destructive' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {dependent.dependencyType === 'blocks' ? 'Zorunlu' : 'İlişkili'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}

      {/* Uyarı: Bağımlı görevler tamamlanmamışsa */}
      {dependencyCheck &&
        !dependencyCheck.allComplete &&
        dependencyCheck.incompleteDependencies.length > 0 && (
          <EnhancedCard variant="glass" className="p-4 bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-600 dark:text-yellow-400">
                  Bağımlılık Uyarısı
                </p>
                <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                  Bu görev, {dependencyCheck.incompleteDependencies.length} tamamlanmamış zorunlu
                  bağımlılığa sahip. Görevi başlatmak için bağımlı görevlerin tamamlanmış olması
                  gerekir.
                </p>
                <div className="mt-2 space-y-1">
                  {dependencyCheck.incompleteDependencies.map((taskId) => (
                    <p key={taskId} className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
                      • {getTaskTitle(taskId)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </EnhancedCard>
        )}
      {dependencyCheck &&
        dependencyCheck.allComplete &&
        dependencies.some((dep) => dep.dependencyType === 'blocks') && (
          <EnhancedCard variant="glass" className="p-4 bg-green-500/10 border-green-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-600 dark:text-green-400">
                  Bağımlılıklar Tamamlandı
                </p>
                <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                  Tüm zorunlu bağımlılıklar tamamlandı. Bu görevi başlatabilirsiniz.
                </p>
              </div>
            </div>
          </EnhancedCard>
        )}
    </div>
  );
}
