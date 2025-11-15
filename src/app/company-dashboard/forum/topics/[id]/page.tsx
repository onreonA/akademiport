'use client';

import { use } from 'react';
import { useTopicDetail, useReplies, useCreateReply, useLikeTopic, useUnlikeTopic, useMarkSolution } from '@/1-presentation/hooks/useForum';
import { ReplyForm } from '@/1-presentation/components/features/forum/ReplyForm';
import { CreateReplyDto, UpdateReplyDto } from '@/2-application/dtos/forum';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Loader2, ArrowLeft, Eye, Heart, MessageCircle, Pin, Lock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TOPIC_STATUS_LABELS, TOPIC_STATUS_COLORS, TOPIC_PRIORITY_LABELS, TOPIC_PRIORITY_COLORS } from '@/3-domain/enums/ForumEnums';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { Separator } from '@/presentation/components/ui/atoms/separator';

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: topic, isLoading } = useTopicDetail(id);
  const { data: repliesData, isLoading: repliesLoading } = useReplies(id);
  const createReply = useCreateReply();
  const likeTopic = useLikeTopic();
  const unlikeTopic = useUnlikeTopic();
  const markSolution = useMarkSolution();
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleCreateReply = async (dto: CreateReplyDto | UpdateReplyDto) => {
    // Type guard: ensure it's CreateReplyDto
    if ('topicId' in dto || !('id' in dto)) {
      await createReply.mutateAsync({ topicId: id, dto: dto as CreateReplyDto });
    }
    setIsReplyFormOpen(false);
    setReplyingTo(null);
  };

  const handleLike = async () => {
    await likeTopic.mutateAsync(id);
  };

  const handleUnlike = async () => {
    await unlikeTopic.mutateAsync(id);
  };

  const handleMarkSolution = async (replyId: string) => {
    await markSolution.mutateAsync({ topicId: id, replyId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Konu bulunamadı</p>
        <Button onClick={() => router.push('/company-dashboard/forum')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  const statusColor = TOPIC_STATUS_COLORS[topic.status];
  const statusLabel = TOPIC_STATUS_LABELS[topic.status];
  const priorityColor = TOPIC_PRIORITY_COLORS[topic.priority];
  const priorityLabel = TOPIC_PRIORITY_LABELS[topic.priority];
  const replies = repliesData?.replies || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/company-dashboard/forum')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <Button onClick={() => setIsReplyFormOpen(true)} disabled={topic.isLocked}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Yanıt Yaz
        </Button>
      </div>

      {/* Topic Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {topic.category && topic.category.color && (
              <Badge variant="outline" style={{ backgroundColor: topic.category.color + '20', borderColor: topic.category.color }}>
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
          <h1 className="text-3xl font-bold">{topic.title}</h1>
        </CardHeader>
        <CardContent>
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            {topic.authorName && <span>Yazar: {topic.authorName}</span>}
            {topic.createdAt && (
              <span>
                Oluşturulma: {format(new Date(topic.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{topic.viewCount} görüntülenme</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>{topic.replyCount} yanıt</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
              >
                <Heart className="h-4 w-4" />
                <span className="ml-1">{topic.likeCount}</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none whitespace-pre-wrap">
            {topic.content}
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Yanıtlar ({replies.length})</h2>
        
        {repliesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : replies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Henüz yanıt yok. İlk yanıtı siz yazın!</p>
            </CardContent>
          </Card>
        ) : (
          replies.map((reply) => (
            <Card key={reply.id} className={reply.isSolution ? 'border-l-4 border-l-green-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{reply.authorName || 'Anonim'}</span>
                    {reply.isSolution && (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Çözüm
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {reply.createdAt && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(reply.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </span>
                    )}
                    {!topic.isLocked && !reply.isSolution && topic.authorId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkSolution(reply.id)}
                      >
                        Çözüm İşaretle
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none whitespace-pre-wrap">
                  {reply.content}
                </div>
                {reply.isEdited && (
                  <p className="text-xs text-muted-foreground mt-2">(Düzenlendi)</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Form */}
      {isReplyFormOpen && !topic.isLocked && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Yanıt Yaz</h3>
          </CardHeader>
          <CardContent>
            <ReplyForm
              topicId={id}
              parentId={replyingTo}
              onSubmit={handleCreateReply}
              onCancel={() => {
                setIsReplyFormOpen(false);
                setReplyingTo(null);
              }}
              isSubmitting={createReply.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

