'use client';

import { useState } from 'react';
import {
  useTopicDetail,
  useReplies,
  useCreateReply,
  useLikeTopic,
  useMarkSolution,
} from '@/1-presentation/hooks/useForum';
import {
  ForumTopicWithDetails,
  ForumReplyWithDetails,
} from '@/3-domain/interfaces/repositories/IForumRepository';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { ReplyForm } from './ReplyForm';
import { ReplyTree } from './ReplyTree';
import {
  TOPIC_STATUS_LABELS,
  TOPIC_STATUS_COLORS,
  TOPIC_PRIORITY_LABELS,
  TOPIC_PRIORITY_COLORS,
} from '@/3-domain/enums/ForumEnums';
import { CreateReplyDto, UpdateReplyDto } from '@/2-application/dtos/forum';
import {
  Eye,
  Heart,
  MessageCircle,
  Pin,
  Lock,
  CheckCircle2,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';
import { Loader2 } from 'lucide-react';

interface TopicDetailProps {
  topicId: string;
  basePath?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function TopicDetail({
  topicId,
  basePath = '/forum',
  onEdit,
  onDelete,
  showActions = false,
}: TopicDetailProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: topic, isLoading: topicLoading } = useTopicDetail(topicId);
  const { data: repliesData, isLoading: repliesLoading } = useReplies(topicId);
  const createReply = useCreateReply();
  const likeTopic = useLikeTopic();
  const markSolution = useMarkSolution();

  const replies = repliesData?.replies || [];
  const isLiked = false; // TODO: Get from topic data or separate query

  const handleCreateReply = async (dto: CreateReplyDto | UpdateReplyDto) => {
    if ('topicId' in dto || !('id' in dto)) {
      await createReply.mutateAsync({
        topicId,
        dto: {
          ...dto,
          parentId: replyingTo || null,
        } as CreateReplyDto,
      });
    }
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  const handleLike = async () => {
    if (topic) {
      await likeTopic.mutateAsync(topic.id);
    }
  };

  const handleMarkSolution = async (replyId: string) => {
    if (topic) {
      await markSolution.mutateAsync({ topicId: topic.id, replyId });
    }
  };

  if (topicLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Konu bulunamadı</p>
        <Link href={basePath}>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </Link>
      </div>
    );
  }

  const statusColor = TOPIC_STATUS_COLORS[topic.status];
  const statusLabel = TOPIC_STATUS_LABELS[topic.status];
  const priorityColor = TOPIC_PRIORITY_COLORS[topic.priority];
  const priorityLabel = TOPIC_PRIORITY_LABELS[topic.priority];

  // Build reply tree (nested structure)
  const buildReplyTree = (replies: ForumReplyWithDetails[]): ForumReplyWithDetails[] => {
    const replyMap = new Map<string, ForumReplyWithDetails>();
    const rootReplies: ForumReplyWithDetails[] = [];

    // First pass: create map
    replies.forEach((reply) => {
      replyMap.set(reply.id, { ...reply, replies: [] });
    });

    // Second pass: build tree
    replies.forEach((reply) => {
      const replyNode = replyMap.get(reply.id)!;
      if (reply.parentId) {
        const parent = replyMap.get(reply.parentId);
        if (parent) {
          if (!parent.replies) {
            parent.replies = [];
          }
          parent.replies.push(replyNode);
        }
      } else {
        rootReplies.push(replyNode);
      }
    });

    return rootReplies;
  };

  const replyTree = buildReplyTree(replies);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={basePath}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </Link>

      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Category, Status & Priority */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {topic.category && topic.category.color && (
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: topic.category.color + '20',
                      borderColor: topic.category.color,
                    }}
                  >
                    {topic.category.name}
                  </Badge>
                )}
                <Badge className={statusColor}>{statusLabel}</Badge>
                <Badge className={priorityColor}>{priorityLabel}</Badge>
                {topic.isPinned && (
                  <Badge className="bg-yellow-500">
                    <Pin className="w-3 h-3 mr-1" />
                    Sabitlenmiş
                  </Badge>
                )}
                {topic.isLocked && (
                  <Badge className="bg-gray-500">
                    <Lock className="w-3 h-3 mr-1" />
                    Kilitli
                  </Badge>
                )}
                {topic.status === 'solved' && topic.solutionReplyId && (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Çözüldü
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>

              {/* Author & Date */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {topic.authorName || 'Bilinmeyen Kullanıcı'}
                  {topic.companyName && ` • ${topic.companyName}`}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(topic.createdAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                </span>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(topic.id)}>
                    Düzenle
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={() => onDelete(topic.id)}>
                    Sil
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Content */}
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap">{topic.content}</div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {topic.viewCount} görüntüleme
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {topic.replyCount} yanıt
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? 'default' : 'outline'}
                size="sm"
                onClick={handleLike}
                disabled={likeTopic.isPending}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {topic.likeCount}
              </Button>
              {!topic.isLocked && (
                <Button variant="default" size="sm" onClick={() => setShowReplyForm(true)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Yanıtla
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {showReplyForm && !topic.isLocked && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Yanıt Yaz</h3>
          </CardHeader>
          <CardContent>
            <ReplyForm
              topicId={topicId}
              parentId={replyingTo}
              onSubmit={handleCreateReply}
              onCancel={() => {
                setShowReplyForm(false);
                setReplyingTo(null);
              }}
              isSubmitting={createReply.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Yanıtlar <span className="text-muted-foreground">({replies.length})</span>
        </h2>

        {repliesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : replyTree.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Henüz yanıt yok. İlk yanıtı siz yazın!
            </CardContent>
          </Card>
        ) : (
          <ReplyTree
            replies={replyTree}
            topicId={topicId}
            solutionReplyId={topic.solutionReplyId}
            onReply={(replyId) => {
              setReplyingTo(replyId);
              setShowReplyForm(true);
            }}
            onMarkSolution={handleMarkSolution}
            isTopicAuthor={false} // TODO: Get from auth context
            onLike={async (replyId) => {
              // TODO: Implement like reply
            }}
            onEdit={async (replyId, data) => {
              // TODO: Implement edit reply
            }}
            onDelete={async (replyId) => {
              // TODO: Implement delete reply
            }}
          />
        )}
      </div>
    </div>
  );
}
