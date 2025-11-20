'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link2, Link2Off, Plus, Trash2, AlertCircle } from 'lucide-react';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import { Label } from '@/presentation/components/ui/atoms/label';
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
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setTasks(data.tasks || data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDependencies();
    fetchTasks();
  }, [fetchDependencies, fetchTasks]);

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
            {dependencies.map((dependency) => (
              <div
                key={dependency.id}
                className="flex items-center justify-between p-3 bg-background/50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{getTaskTitle(dependency.dependsOnTaskId)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          dependency.dependencyType === 'blocks' ? 'destructive' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {dependency.dependencyType === 'blocks' ? 'Zorunlu' : 'İlişkili'}
                      </Badge>
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
            ))}
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
      {dependencies.some((dep) => dep.dependencyType === 'blocks') && (
        <EnhancedCard variant="glass" className="p-4 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-600 dark:text-yellow-400">Bağımlılık Uyarısı</p>
              <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                Bu görev, zorunlu bağımlılıklara sahip. Görevi başlatmak için bağımlı görevlerin
                tamamlanmış olması gerekir.
              </p>
            </div>
          </div>
        </EnhancedCard>
      )}
    </div>
  );
}
