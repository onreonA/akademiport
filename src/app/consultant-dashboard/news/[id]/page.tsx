'use client';

import { use, useEffect, useState } from 'react';
import { useNewsDetail, useLikeNews, useUnlikeNews } from '@/1-presentation/hooks/useNews';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Loader2, ArrowLeft, Eye, Heart, MessageCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NEWS_CATEGORY_LABELS } from '@/3-domain/enums/NewsEnums';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ConsultantNewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: news, isLoading } = useNewsDetail(id);
  const likeNews = useLikeNews();
  const unlikeNews = useUnlikeNews();

  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (isLiked) {
      await unlikeNews.mutateAsync(id);
      setIsLiked(false);
    } else {
      await likeNews.mutateAsync(id);
      setIsLiked(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Haber bulunamadı</p>
        <Button onClick={() => router.push('/consultant-dashboard/news')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  const categoryLabel = NEWS_CATEGORY_LABELS[news.category];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/consultant-dashboard/news')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </div>

      {/* News Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{categoryLabel}</Badge>
            {news.isFeatured && <Badge className="bg-yellow-500">Öne Çıkan</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{news.title}</h1>
          {news.summary && <p className="text-lg text-muted-foreground mt-2">{news.summary}</p>}
        </CardHeader>
        <CardContent>
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            {news.authorName && <span>Yazar: {news.authorName}</span>}
            {news.publishedAt && (
              <span>{format(new Date(news.publishedAt), 'dd MMM yyyy', { locale: tr })}</span>
            )}
            {news.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{news.readingTime} dk okuma</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {news.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Image */}
          {news.imageUrl && (
            <div className="mb-6">
              <img
                src={news.imageUrl}
                alt={news.imageAlt || news.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Actions */}
          <div className="flex items-center gap-6 pt-6 border-t">
            <Button
              variant={isLiked ? 'default' : 'outline'}
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{news.likeCount}</span>
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{news.viewCount} görüntülenme</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{news.commentCount} yorum</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
