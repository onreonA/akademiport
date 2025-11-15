'use client';

import { ForumTopicWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';
import { TOPIC_STATUS_LABELS, TOPIC_STATUS_COLORS, TOPIC_PRIORITY_LABELS, TOPIC_PRIORITY_COLORS } from '@/3-domain/enums/ForumEnums';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Eye, Heart, MessageCircle, Pin, Lock, CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface TopicCardProps {
  topic: ForumTopicWithDetails;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onLock?: (id: string) => void;
  showActions?: boolean;
  basePath?: string; // e.g., '/admin-dashboard/forum' or '/company-dashboard/forum'
}

export function TopicCard({
  topic,
  onEdit,
  onDelete,
  onPin,
  onLock,
  showActions = false,
  basePath = '/forum',
}: TopicCardProps) {
  const statusColor = TOPIC_STATUS_COLORS[topic.status];
  const statusLabel = TOPIC_STATUS_LABELS[topic.status];
  const priorityColor = TOPIC_PRIORITY_COLORS[topic.priority];
  const priorityLabel = TOPIC_PRIORITY_LABELS[topic.priority];

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${topic.isPinned ? 'border-l-4 border-l-primary' : ''}`}>
      <CardHeader>
        {/* Category, Status & Priority */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {topic.category && (
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

        {/* Title */}
        <Link href={`${basePath}/topics/${topic.id}`}>
          <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
            {topic.title}
          </h3>
        </Link>

        {/* Content Preview */}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{topic.content}</p>
      </CardHeader>

      <CardContent>
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {topic.authorName && (
            <div className="flex items-center gap-1">
              <span>Yazar: {topic.authorName}</span>
            </div>
          )}
          {topic.lastReplyAt && (
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{format(new Date(topic.lastReplyAt), 'dd MMM yyyy', { locale: tr })}</span>
            </div>
          )}
          {topic.createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(topic.createdAt), 'dd MMM yyyy', { locale: tr })}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{topic.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{topic.replyCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{topic.likeCount}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            {onPin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPin(topic.id)}
              >
                {topic.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
              </Button>
            )}
            {onLock && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLock(topic.id)}
              >
                {topic.isLocked ? 'Kilidi Aç' : 'Kilitle'}
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(topic.id)}>
                Düzenle
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(topic.id)}>
                Sil
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

