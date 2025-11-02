'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Textarea } from '@/1-presentation/components/ui/atoms/textarea';
import { EnhancedCard } from '@/1-presentation/components/ui/atoms/enhanced-card';
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { MessageSquare, Send, Loader2, Trash2, HelpCircle, Reply } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  isQuestion: boolean;
  parentCommentId?: string | null;
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');

      const data = await response.json();
      // API returns { success: true, comments: [...] }
      setComments(data.comments || (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentCommentId?: string | null) => {
    e.preventDefault();
    const commentText = parentCommentId ? replyText : newComment;
    if (!commentText.trim()) return;

    setSubmitting(true);

    // Form'dan checkbox değerini direkt oku (sadece ana form için)
    const form = e.currentTarget;
    const checkboxElement = form.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const isQuestionChecked = parentCommentId ? false : (checkboxElement?.checked ?? isQuestion);

    try {
      const payload = {
        comment: commentText.trim(),
        isQuestion: isQuestionChecked,
        parentCommentId: parentCommentId || null,
      };

      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      const data = await response.json();
      // API returns { success: true, comment: {...} }
      const newCommentData = data.comment || data;

      if (parentCommentId) {
        // Cevap ekleniyor - cevapları parent'ın altına ekle
        setComments([...comments, newCommentData]);
        setReplyText('');
        setReplyingTo(null);
        toast.success('Cevap eklendi!');
      } else {
        // Yeni yorum/soru ekleniyor - başa ekle
        setComments([newCommentData, ...comments]);
        setNewComment('');
        setIsQuestion(false);
        if (checkboxElement) {
          checkboxElement.checked = false;
        }
        toast.success(isQuestionChecked ? 'Soru eklendi!' : 'Yorum eklendi!');
      }

      // Yorumları yeniden yükle (parent-child ilişkilerini doğru göstermek için)
      await fetchComments();
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
      // Yorumları yeniden yükle (silme sonrası parent-child ilişkilerini doğru göstermek için)
      await fetchComments();
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
            placeholder={isQuestion ? 'Sorunuzu buraya yazın...' : 'Yorumunuzu buraya yazın...'}
            rows={3}
            disabled={submitting}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isQuestion"
                checked={isQuestion}
                onChange={(e) => {
                  const checked = e.target.checked;
                  console.log('[TaskComments] Checkbox changed:', checked);
                  setIsQuestion(checked);
                }}
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
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Yorumlar ({comments.length})</h3>
            {comments.some((c) => c.isQuestion) && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <HelpCircle className="w-3 h-3 mr-1" />
                {comments.filter((c) => c.isQuestion).length} Soru
              </Badge>
            )}
          </div>
        </div>

        {comments.length === 0 ? (
          <EnhancedCard className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Henüz yorum yok</p>
            <p className="text-sm text-muted-foreground mt-1">İlk yorumu siz ekleyin!</p>
          </EnhancedCard>
        ) : (
          <div className="space-y-3">
            {comments
              .filter((c) => !c.parentCommentId) // Sadece ana yorumlar/sorular
              .map((comment) => {
                // Bu yorumun cevaplarını bul
                const replies = comments
                  .filter((c) => c.parentCommentId === comment.id)
                  .sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                const isReplying = replyingTo === comment.id;

                return (
                  <div key={comment.id} className="space-y-2">
                    <EnhancedCard
                      className={`p-4 ${
                        comment.isQuestion
                          ? 'border-blue-200 bg-blue-50/50'
                          : comment.parentCommentId
                            ? 'border-l-4 border-l-green-300 bg-green-50/30 ml-4'
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
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-700"
                              >
                                <HelpCircle className="w-3 h-3 mr-1" />
                                Soru
                              </Badge>
                            )}
                            {comment.parentCommentId && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-700"
                              >
                                <Reply className="w-3 h-3 mr-1" />
                                Cevap
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>

                          {/* Sorulara "Cevap Ver" butonu */}
                          {comment.isQuestion && !comment.parentCommentId && (
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                                }
                                className="text-xs"
                              >
                                <Reply className="w-3 h-3 mr-1" />
                                {isReplying ? 'İptal' : 'Cevap Ver'}
                              </Button>
                              {replies.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {replies.length} cevap
                                </span>
                              )}
                            </div>
                          )}

                          {/* Cevap input alanı */}
                          {isReplying && comment.isQuestion && (
                            <form
                              onSubmit={(e) => handleSubmit(e, comment.id)}
                              className="mt-3 pt-3 border-t border-gray-200"
                            >
                              <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Cevabınızı buraya yazın..."
                                rows={2}
                                disabled={submitting}
                                className="mb-2"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={submitting || !replyText.trim()}
                                >
                                  {submitting ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Gönderiliyor...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3 h-3 mr-1" />
                                      Cevap Gönder
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                >
                                  İptal
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {comment.userId === currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(comment.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </EnhancedCard>

                    {/* Cevap listesi */}
                    {replies.length > 0 && (
                      <div className="ml-4 space-y-2">
                        {replies.map((reply) => (
                          <EnhancedCard
                            key={reply.id}
                            className="p-3 border-l-4 border-l-green-300 bg-green-50/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-xs">
                                    {reply.user?.fullName || reply.user?.email || 'Kullanıcı'}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-100 text-green-700"
                                  >
                                    <Reply className="w-3 h-3 mr-1" />
                                    Cevap
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(reply.createdAt).toLocaleString('tr-TR')}
                                  </span>
                                </div>
                                <p className="text-xs whitespace-pre-wrap">{reply.comment}</p>
                              </div>
                              {reply.userId === currentUserId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(reply.id)}
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </EnhancedCard>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
