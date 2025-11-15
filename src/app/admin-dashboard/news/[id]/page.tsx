'use client';

import { use } from 'react';
import { useNewsDetail, useUpdateNews, usePublishNews, useDeleteNews } from '@/1-presentation/hooks/useNews';
import { NewsForm } from '@/1-presentation/components/features/news';
import { UpdateNewsDto } from '@/2-application/dtos/news';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Loader2, ArrowLeft, Eye, Heart, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NEWS_CATEGORY_LABELS, NEWS_STATUS_LABELS, NEWS_STATUS_COLORS } from '@/3-domain/enums/NewsEnums';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function AdminNewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: news, isLoading } = useNewsDetail(id);
  const updateNews = useUpdateNews();
  const publishNews = usePublishNews();
  const deleteNews = useDeleteNews();

  const handleUpdate = async (dto: UpdateNewsDto) => {
    await updateNews.mutateAsync({ id, dto });
  };

  const handlePublish = async () => {
    await publishNews.mutateAsync(id);
  };

  const handleDelete = async () => {
    if (confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
      await deleteNews.mutateAsync(id);
      router.push('/admin-dashboard/news');
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
        <Button onClick={() => router.push('/admin-dashboard/news')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  const statusColor = NEWS_STATUS_COLORS[news.status];
  const statusLabel = NEWS_STATUS_LABELS[news.status];
  const categoryLabel = NEWS_CATEGORY_LABELS[news.category];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin-dashboard/news')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <div className="flex items-center gap-2">
          {news.status === 'draft' && (
            <Button onClick={handlePublish}>Yayınla</Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            Sil
          </Button>
        </div>
      </div>

      {/* News Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{categoryLabel}</Badge>
            <Badge variant="outline" className={`bg-${statusColor}-100 text-${statusColor}-700`}>
              {statusLabel}
            </Badge>
            {news.isFeatured && <Badge className="bg-yellow-500">Öne Çıkan</Badge>}
            {news.isPinned && <Badge className="bg-red-500">Sabitlenmiş</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{news.title}</h1>
          {news.summary && (
            <p className="text-muted-foreground mt-2">{news.summary}</p>
          )}
        </CardHeader>
        <CardContent>
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            {news.authorName && <span>Yazar: {news.authorName}</span>}
            {news.publishedAt && (
              <span>
                Yayın: {format(new Date(news.publishedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
              </span>
            )}
            {news.readingTime && <span>{news.readingTime} dk okuma</span>}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{news.viewCount} görüntülenme</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>{news.likeCount} beğeni</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>{news.commentCount} yorum</span>
            </div>
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
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Haberi Düzenle</h2>
        </CardHeader>
        <CardContent>
          <NewsForm
            programId={news.programId}
            initialData={news}
            onSubmit={handleUpdate}
            isSubmitting={updateNews.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

