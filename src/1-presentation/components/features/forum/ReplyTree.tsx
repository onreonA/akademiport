'use client';

import { ForumReplyWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';
import { ReplyCard } from './ReplyCard';

interface ReplyTreeProps {
  replies: ForumReplyWithDetails[];
  topicId: string;
  solutionReplyId?: string | null;
  onReply?: (replyId: string) => void;
  onEdit?: (replyId: string, data: any) => Promise<void>;
  onDelete?: (replyId: string) => Promise<void>;
  onLike?: (replyId: string) => Promise<void>;
  onMarkSolution?: (replyId: string) => Promise<void>;
  isTopicAuthor?: boolean;
}

export function ReplyTree({
  replies,
  topicId,
  solutionReplyId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onMarkSolution,
  isTopicAuthor = false,
}: ReplyTreeProps) {
  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <ReplyCard
          key={reply.id}
          reply={reply}
          topicId={topicId}
          solutionReplyId={solutionReplyId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onLike={onLike}
          onMarkSolution={onMarkSolution}
          isTopicAuthor={isTopicAuthor}
          isAuthor={false} // TODO: Get from auth context
          depth={0}
        />
      ))}
    </div>
  );
}
