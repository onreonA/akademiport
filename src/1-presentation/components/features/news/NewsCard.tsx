'use client';

import { NewsWithTags } from '@/3-domain/interfaces/repositories/INewsRepository';
import {
  NEWS_CATEGORY_LABELS,
  NEWS_STATUS_COLORS,
  NEWS_STATUS_LABELS,
} from '@/3-domain/enums/NewsEnums';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Eye, Heart, MessageCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface NewsCardProps {
  news: NewsWithTags;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  showActions?: boolean;
  basePath?: string; // e.g., '/admin-dashboard/news' or '/company-dashboard/news'
}

export function NewsCard({
  news,
  onEdit,
  onDelete,
  onPublish,
  showActions = false,
  basePath = '/news',
}: NewsCardProps) {
  const statusColor = NEWS_STATUS_COLORS[news.status];
  const statusLabel = NEWS_STATUS_LABELS[news.status];
  const categoryLabel = NEWS_CATEGORY_LABELS[news.category];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {news.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={news.imageUrl}
            alt={news.imageAlt || news.title}
            className="h-full w-full object-cover"
          />
          {news.isPinned && (
            <Badge className="absolute top-2 right-2 bg-red-500">Sabitlenmiş</Badge>
          )}
          {news.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500">Öne Çıkan</Badge>
          )}
        </div>
      )}

      <CardHeader>
        {/* Category & Status */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{categoryLabel}</Badge>
          <Badge variant="outline" className={`bg-${statusColor}-100 text-${statusColor}-700`}>
            {statusLabel}
          </Badge>
        </div>

        {/* Title */}
        <Link href={`${basePath}/${news.id}`}>
          <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
            {news.title}
          </h3>
        </Link>

        {/* Summary */}
        {news.summary && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{news.summary}</p>
        )}
      </CardHeader>

      <CardContent>
        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {news.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {news.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{news.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {news.authorName && (
            <div className="flex items-center gap-1">
              <span>Yazar: {news.authorName}</span>
            </div>
          )}
          {news.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(news.publishedAt), 'dd MMM yyyy', { locale: tr })}</span>
            </div>
          )}
          {news.readingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{news.readingTime} dk</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{news.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{news.likeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{news.commentCount}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            {news.status === 'draft' && onPublish && (
              <Button size="sm" variant="outline" onClick={() => onPublish(news.id)}>
                Yayınla
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(news.id)}>
                Düzenle
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={() => onDelete(news.id)}>
                Sil
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
