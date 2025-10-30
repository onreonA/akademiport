'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ListTodo,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  User,
} from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';

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

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  is_question: boolean;
  created_at: string;
  user?: {
    full_name: string;
    role: string;
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

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      const data = await response.json();
      setTask(data.task);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment,
          is_question: isQuestion,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add comment');
      }

      setNewComment('');
      setIsQuestion(false);
      await fetchComments();
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

        {/* Comments Section */}
        <EnhancedCard variant="glass" className="p-6 md:p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Yorumlar & Sorular ({comments.length})
          </h3>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Henüz yorum yok</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold shrink-0">
                      {comment.user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{comment.user?.full_name || 'Kullanıcı'}</p>
                        {comment.is_question && (
                          <Badge variant="outline" className="text-xs">
                            Soru
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorum veya soru yazın..."
              rows={3}
              disabled={submitting}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isQuestion}
                  onChange={(e) => setIsQuestion(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Bu bir soru</span>
              </label>
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="w-full sm:w-auto"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </div>
          </form>
        </EnhancedCard>
      </div>
    </div>
  );
}
