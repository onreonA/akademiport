'use client';

import { useState } from 'react';
import {
  usePendingNewsModeration,
  useModerateNews,
  useDetectNewsSpam,
} from '@/1-presentation/hooks/useNewsModeration';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/atoms/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/presentation/components/ui/atoms/dialog';
import { Loader2, Check, X, Shield, Eye, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { NewsStatus, NEWS_STATUS_LABELS } from '@/3-domain/enums/NewsEnums';

export function NewsModerationPanel() {
  const [selectedStatus, setSelectedStatus] = useState<'draft' | 'pending' | 'all'>('draft');
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [showSpamDetails, setShowSpamDetails] = useState(false);

  const { data, isLoading, refetch } = usePendingNewsModeration(selectedStatus);
  const moderateNews = useModerateNews();
  const detectSpam = useDetectNewsSpam();

  const news = data?.news || [];
  const spamDetections = data?.spamDetections || [];

  const handleModerate = async (action: 'approve' | 'reject' | 'publish', newsId: string) => {
    await moderateNews.mutateAsync({
      action,
      newsId,
    });
    setSelectedNews(null);
  };

  const handleDetectSpam = async (newsItem: any) => {
    try {
      const result = await detectSpam.mutateAsync({
        newsId: newsItem.id,
        title: newsItem.title,
        content: newsItem.content,
        summary: newsItem.summary,
        authorId: newsItem.author_id,
      });

      if (result.success && result.data) {
        setSelectedNews({ ...newsItem, spamDetection: result.data });
        setShowSpamDetails(true);
        toast.success('Spam tespiti tamamlandı');
      }
    } catch (error) {
      toast.error('Spam tespiti başarısız');
    }
  };

  const getSpamScoreColor = (score: number) => {
    if (score < 40) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSpamBadgeVariant = (score: number) => {
    if (score < 40) return 'default';
    if (score < 70) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Haber Moderasyon Paneli</h2>
          <p className="text-sm text-muted-foreground">{news.length} bekleyen haber</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'draft' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('draft')}
          >
            Taslaklar
          </Button>
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('all')}
          >
            Tümü
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            Yenile
          </Button>
        </div>
      </div>

      {/* News Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Spam Skoru</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Bekleyen haber bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              news.map((newsItem: any) => {
                const spamDetection =
                  newsItem.news_spam_detections?.[0] ||
                  spamDetections.find((sd: any) => sd.news_id === newsItem.id);
                return (
                  <TableRow key={newsItem.id}>
                    <TableCell className="font-medium max-w-md truncate">
                      {newsItem.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{newsItem.category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {NEWS_STATUS_LABELS[newsItem.status as NewsStatus] || newsItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(newsItem.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </TableCell>
                    <TableCell>
                      {spamDetection ? (
                        <Badge
                          variant={getSpamBadgeVariant(spamDetection.spam_score)}
                          className={getSpamScoreColor(spamDetection.spam_score)}
                        >
                          {spamDetection.spam_score}/100
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDetectSpam(newsItem)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedNews(newsItem)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleModerate('publish', newsItem.id)}
                          disabled={moderateNews.isPending}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleModerate('reject', newsItem.id)}
                          disabled={moderateNews.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedNews && !showSpamDetails}
        onOpenChange={(open) => !open && setSelectedNews(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNews?.title}</DialogTitle>
            <DialogDescription>
              {selectedNews?.category} • {selectedNews?.author_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedNews?.summary && (
              <div>
                <h4 className="font-semibold mb-2">Özet:</h4>
                <p className="text-sm text-muted-foreground">{selectedNews.summary}</p>
              </div>
            )}
            <div>
              <h4 className="font-semibold mb-2">İçerik:</h4>
              <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {selectedNews?.content}
              </div>
            </div>
            {selectedNews?.news_spam_detections?.[0] && (
              <div>
                <h4 className="font-semibold mb-2">Spam Tespiti:</h4>
                <div className="space-y-2">
                  <div>
                    <Badge
                      variant={getSpamBadgeVariant(selectedNews.news_spam_detections[0].spam_score)}
                    >
                      Skor: {selectedNews.news_spam_detections[0].spam_score}/100
                    </Badge>
                  </div>
                  {selectedNews.news_spam_detections[0].spam_reason && (
                    <p className="text-sm text-muted-foreground">
                      {selectedNews.news_spam_detections[0].spam_reason}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedNews(null)}>
                Kapat
              </Button>
              <Button variant="default" onClick={() => handleModerate('publish', selectedNews?.id)}>
                Yayınla
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleModerate('reject', selectedNews?.id)}
              >
                Reddet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spam Detection Details Dialog */}
      <Dialog open={showSpamDetails} onOpenChange={setShowSpamDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Spam Tespiti Sonuçları</DialogTitle>
          </DialogHeader>
          {selectedNews?.spamDetection && (
            <div className="space-y-4">
              <div>
                <Badge
                  variant={getSpamBadgeVariant(selectedNews.spamDetection.spamScore)}
                  className="text-lg"
                >
                  Spam Skoru: {selectedNews.spamDetection.spamScore}/100
                </Badge>
              </div>
              {selectedNews.spamDetection.spamReason && (
                <div>
                  <h4 className="font-semibold mb-2">Neden:</h4>
                  <p className="text-sm">{selectedNews.spamDetection.spamReason}</p>
                </div>
              )}
              {selectedNews.spamDetection.factors?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Faktörler:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedNews.spamDetection.factors.map((factor: any, idx: number) => (
                      <li key={idx} className="text-sm">
                        {factor.name}: {factor.description} (Skor: {factor.score})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Öneri:</h4>
                <Badge
                  variant={
                    selectedNews.spamDetection.recommendation === 'approve'
                      ? 'default'
                      : selectedNews.spamDetection.recommendation === 'reject'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {selectedNews.spamDetection.recommendation === 'approve'
                    ? 'Onayla'
                    : selectedNews.spamDetection.recommendation === 'reject'
                      ? 'Reddet'
                      : 'İncele'}
                </Badge>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSpamDetails(false);
                    setSelectedNews(null);
                  }}
                >
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
