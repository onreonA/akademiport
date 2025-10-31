'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Textarea } from '@/1-presentation/components/ui/atoms/textarea';
import { EnhancedCard } from '@/1-presentation/components/ui/atoms/enhanced-card';
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { MessageSquare, Send, Loader2, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  isQuestion: boolean;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
}

interface TaskCommentsProps {
  taskId: string;
  currentUserId: string;
}

export function TaskComments({ taskId, currentUserId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');

      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment.trim(),
          isQuestion,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      const data = await response.json();
      setComments([data, ...comments]);
      setNewComment('');
      setIsQuestion(false);
      toast.success(isQuestion ? 'Soru eklendi!' : 'Yorum eklendi!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      setComments(comments.filter((c) => c.id !== commentId));
      toast.success('Yorum silindi');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <EnhancedCard>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </EnhancedCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Comment Form */}
      <EnhancedCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Yeni Yorum / Soru</h3>
          </div>

          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              isQuestion
                ? 'Sorunuzu buraya yazın...'
                : 'Yorumunuzu buraya yazın...'
            }
            rows={3}
            disabled={submitting}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isQuestion}
                onChange={(e) => setIsQuestion(e.target.checked)}
                disabled={submitting}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                Bu bir soru
              </span>
            </label>

            <Button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Gönder
                </>
              )}
            </Button>
          </div>
        </form>
      </EnhancedCard>

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Yorumlar ({comments.length})
          </h3>
        </div>

        {comments.length === 0 ? (
          <EnhancedCard className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Henüz yorum yok</p>
            <p className="text-sm text-muted-foreground mt-1">
              İlk yorumu siz ekleyin!
            </p>
          </EnhancedCard>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <EnhancedCard
                key={comment.id}
                className={`p-4 ${
                  comment.isQuestion
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {comment.user?.fullName || comment.user?.email || 'Kullanıcı'}
                      </span>
                      {comment.isQuestion && (
                        <Badge variant="secondary" className="text-xs">
                          <HelpCircle className="w-3 h-3 mr-1" />
                          Soru
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                  </div>

                  {comment.userId === currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </EnhancedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

