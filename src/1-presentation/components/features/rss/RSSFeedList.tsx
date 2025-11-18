'use client';

import { useState } from 'react';
import { useRSSFeeds, useDeleteRSSFeed } from '@/1-presentation/hooks/useRSSFeeds';
import { RSSFeed } from '@/3-domain/entities/RSSFeed';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/atoms/table';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Loader2, Plus, Search, Edit, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

interface RSSFeedListProps {
  programId?: string;
  showActions?: boolean;
  onCreateClick?: () => void;
  onEditClick?: (feed: RSSFeed) => void;
}

export function RSSFeedList({
  programId,
  showActions = false,
  onCreateClick,
  onEditClick,
}: RSSFeedListProps) {
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useRSSFeeds(programId);
  const deleteFeed = useDeleteRSSFeed();

  const feeds = data?.data || [];
  const filteredFeeds = feeds.filter(
    (feed) =>
      feed.name.toLowerCase().includes(search.toLowerCase()) ||
      feed.feedUrl.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`"${name}" RSS feed'ini silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteFeed.mutateAsync(id);
        toast.success('RSS feed silindi');
      } catch (error) {
        toast.error('RSS feed silinirken bir hata oluştu');
      }
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info('RSS feed listesi yenilendi');
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
          <h2 className="text-2xl font-bold">RSS Feed'ler</h2>
          <p className="text-sm text-muted-foreground">{filteredFeeds.length} feed bulundu</p>
        </div>
        <div className="flex gap-2">
          {onCreateClick && (
            <Button onClick={onCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Feed
            </Button>
          )}
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Feed ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {filteredFeeds.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">RSS feed bulunamadı</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Kontrol</TableHead>
                <TableHead>İstatistikler</TableHead>
                {showActions && <TableHead className="text-right">İşlemler</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeeds.map((feed) => (
                <TableRow key={feed.id}>
                  <TableCell className="font-medium">{feed.name}</TableCell>
                  <TableCell>
                    <a
                      href={feed.feedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {feed.feedUrl.length > 50
                        ? `${feed.feedUrl.substring(0, 50)}...`
                        : feed.feedUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={feed.isActive ? 'default' : 'secondary'}>
                        {feed.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                      {feed.autoPublish && (
                        <Badge variant="outline" className="text-xs">
                          Otomatik Yayın
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {feed.lastCheckedAt ? (
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(feed.lastCheckedAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Henüz kontrol edilmedi</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Başarı: {feed.successCount}</div>
                      <div className="text-red-600">Hata: {feed.errorCount}</div>
                    </div>
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onEditClick && (
                          <Button variant="ghost" size="sm" onClick={() => onEditClick(feed)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(feed.id, feed.name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
