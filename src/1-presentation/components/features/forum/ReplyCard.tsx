'use client';

import { ForumReplyWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Heart, MessageCircle, CheckCircle2, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { ReplyForm } from './ReplyForm';
import { CreateReplyDto, UpdateReplyDto } from '@/2-application/dtos/forum';

interface ReplyCardProps {
  reply: ForumReplyWithDetails;
  topicId: string;
  solutionReplyId?: string | null;
  onReply?: (replyId: string) => void;
  onEdit?: (replyId: string, data: UpdateReplyDto) => Promise<void>;
  onDelete?: (replyId: string) => Promise<void>;
  onLike?: (replyId: string) => Promise<void>;
  onMarkSolution?: (replyId: string) => Promise<void>;
  isTopicAuthor?: boolean;
  isAuthor?: boolean;
  depth?: number;
}

export function ReplyCard({
  reply,
  topicId,
  solutionReplyId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onMarkSolution,
  isTopicAuthor = false,
  isAuthor = false,
  depth = 0,
}: ReplyCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const isSolution = reply.id === solutionReplyId;
  const maxDepth = 3; // Maximum nesting depth
  const isLiked = false; // TODO: Get from reply data or separate query

  const handleEdit = async (data: CreateReplyDto | UpdateReplyDto) => {
    if (onEdit && 'id' in data) {
      await onEdit(reply.id, data as UpdateReplyDto);
      setIsEditing(false);
    }
  };

  const handleReply = async (data: CreateReplyDto | UpdateReplyDto) => {
    if (onReply) {
      await onReply(reply.id);
      setIsReplying(false);
    }
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <Card className={isSolution ? 'border-green-500 border-2' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isSolution && (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Çözüm
                  </Badge>
                )}
                {reply.isEdited && (
                  <Badge variant="outline" className="text-xs">
                    Düzenlendi
                  </Badge>
                )}
                <span className="text-sm font-medium">
                  {reply.authorName || 'Bilinmeyen Kullanıcı'}
                  {reply.companyName && ` • ${reply.companyName}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(reply.createdAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onLike && (
                <Button
                  variant={isLiked ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onLike(reply.id)}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {reply.likeCount}
                </Button>
              )}
              {onReply && depth < maxDepth && (
                <Button variant="ghost" size="sm" onClick={() => setIsReplying(true)}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Yanıtla
                </Button>
              )}
              {isTopicAuthor && !isSolution && onMarkSolution && (
                <Button variant="outline" size="sm" onClick={() => onMarkSolution(reply.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Çözüm İşaretle
                </Button>
              )}
              {isAuthor && onEdit && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {isAuthor && onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(reply.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <ReplyForm
              topicId={topicId}
              initialData={reply}
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{reply.content}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      {isReplying && (
        <Card className="ml-4">
          <CardContent className="pt-6">
            <ReplyForm
              topicId={topicId}
              parentId={reply.id}
              onSubmit={handleReply}
              onCancel={() => setIsReplying(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Nested Replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {reply.replies.map((nestedReply) => (
            <ReplyCard
              key={nestedReply.id}
              reply={nestedReply}
              topicId={topicId}
              solutionReplyId={solutionReplyId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              onMarkSolution={onMarkSolution}
              isTopicAuthor={isTopicAuthor}
              isAuthor={nestedReply.authorId === reply.authorId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
