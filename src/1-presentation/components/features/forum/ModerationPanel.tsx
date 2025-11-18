'use client';

import { useState } from 'react';
import {
  usePendingModeration,
  useModerateContent,
  useDetectSpam,
} from '@/1-presentation/hooks/useForumModeration';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/presentation/components/ui/atoms/dialog';
import { Loader2, Check, X, Shield, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

export function ModerationPanel() {
  const [selectedType, setSelectedType] = useState<'all' | 'topics' | 'replies'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showSpamDetails, setShowSpamDetails] = useState(false);

  const { data, isLoading, refetch } = usePendingModeration(selectedType);
  const moderateContent = useModerateContent();
  const detectSpam = useDetectSpam();

  const topics = data?.topics || [];
  const replies = data?.replies || [];
  const spamDetections = data?.spamDetections || [];

  const handleModerate = async (
    action: 'approve' | 'reject',
    topicId?: string,
    replyId?: string
  ) => {
    await moderateContent.mutateAsync({
      action,
      topicId,
      replyId,
    });
    setSelectedItem(null);
  };

  const handleDetectSpam = async (item: any, type: 'topic' | 'reply') => {
    try {
      const result = await detectSpam.mutateAsync({
        [type === 'topic' ? 'topicId' : 'replyId']: item.id,
        content: item.content,
        authorId: item.author_id,
      });

      if (result.success && result.data) {
        setSelectedItem({ ...item, spamDetection: result.data });
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
          <h2 className="text-2xl font-bold">Forum Moderasyon Paneli</h2>
          <p className="text-sm text-muted-foreground">
            {topics.length} bekleyen topic, {replies.length} bekleyen reply
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Yenile
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="topics">Topic'ler ({topics.length})</TabsTrigger>
          <TabsTrigger value="replies">Reply'ler ({replies.length})</TabsTrigger>
        </TabsList>

        {/* Topics Tab */}
        <TabsContent value={selectedType === 'all' || selectedType === 'topics' ? 'topics' : ''}>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Yazar</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Spam Skoru</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Bekleyen topic bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  topics.map((topic: any) => {
                    const spamDetection = topic.spam_detections?.[0];
                    return (
                      <TableRow key={topic.id}>
                        <TableCell className="font-medium">{topic.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{topic.forum_categories?.name || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>{topic.author_id}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(topic.created_at), {
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
                              onClick={() => handleDetectSpam(topic, 'topic')}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedItem(topic)}
                            >
                              Detay
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleModerate('approve', topic.id)}
                              disabled={moderateContent.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleModerate('reject', topic.id)}
                              disabled={moderateContent.isPending}
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
        </TabsContent>

        {/* Replies Tab */}
        <TabsContent value={selectedType === 'all' || selectedType === 'replies' ? 'replies' : ''}>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>İçerik</TableHead>
                  <TableHead>Yazar</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Spam Skoru</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {replies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Bekleyen reply bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  replies.map((reply: any) => {
                    const spamDetection = reply.spam_detections?.[0];
                    return (
                      <TableRow key={reply.id}>
                        <TableCell className="font-medium">
                          {reply.forum_topics?.title || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate">{reply.content}</div>
                        </TableCell>
                        <TableCell>{reply.author_id}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(reply.created_at), {
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
                              onClick={() => handleDetectSpam(reply, 'reply')}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedItem(reply)}
                            >
                              Detay
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleModerate('approve', undefined, reply.id)}
                              disabled={moderateContent.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleModerate('reject', undefined, reply.id)}
                              disabled={moderateContent.isPending}
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
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedItem && !showSpamDetails}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title || 'Reply Detayı'}</DialogTitle>
            <DialogDescription>
              {selectedItem?.forum_categories?.name || selectedItem?.forum_topics?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">İçerik:</h4>
              <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {selectedItem?.content}
              </div>
            </div>
            {selectedItem?.spam_detections?.[0] && (
              <div>
                <h4 className="font-semibold mb-2">Spam Tespiti:</h4>
                <div className="space-y-2">
                  <div>
                    <Badge
                      variant={getSpamBadgeVariant(selectedItem.spam_detections[0].spam_score)}
                    >
                      Skor: {selectedItem.spam_detections[0].spam_score}/100
                    </Badge>
                  </div>
                  {selectedItem.spam_detections[0].spam_reason && (
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.spam_detections[0].spam_reason}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Kapat
              </Button>
              <Button
                variant="default"
                onClick={() => handleModerate('approve', selectedItem?.id, selectedItem?.id)}
              >
                Onayla
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleModerate('reject', selectedItem?.id, selectedItem?.id)}
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
          {selectedItem?.spamDetection && (
            <div className="space-y-4">
              <div>
                <Badge
                  variant={getSpamBadgeVariant(selectedItem.spamDetection.spamScore)}
                  className="text-lg"
                >
                  Spam Skoru: {selectedItem.spamDetection.spamScore}/100
                </Badge>
              </div>
              {selectedItem.spamDetection.spamReason && (
                <div>
                  <h4 className="font-semibold mb-2">Neden:</h4>
                  <p className="text-sm">{selectedItem.spamDetection.spamReason}</p>
                </div>
              )}
              {selectedItem.spamDetection.factors?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Faktörler:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedItem.spamDetection.factors.map((factor: any, idx: number) => (
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
                    selectedItem.spamDetection.recommendation === 'approve'
                      ? 'default'
                      : selectedItem.spamDetection.recommendation === 'reject'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {selectedItem.spamDetection.recommendation === 'approve'
                    ? 'Onayla'
                    : selectedItem.spamDetection.recommendation === 'reject'
                      ? 'Reddet'
                      : 'İncele'}
                </Badge>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSpamDetails(false);
                    setSelectedItem(null);
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
