'use client';

import { useState } from 'react';
import { useNewsList, useDeleteNews, usePublishNews } from '@/1-presentation/hooks/useNews';
import { NewsCard } from './NewsCard';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import {
  NewsCategory,
  NewsStatus,
  NEWS_CATEGORY_LABELS,
  NEWS_STATUS_LABELS,
} from '@/3-domain/enums/NewsEnums';
import { Loader2, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NewsListProps {
  programId?: string;
  showActions?: boolean;
  basePath?: string;
  onCreateClick?: () => void;
}

export function NewsList({
  programId,
  showActions = false,
  basePath = '/news',
  onCreateClick,
}: NewsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<NewsCategory | 'all'>('all');
  const [status, setStatus] = useState<NewsStatus | 'all'>('all');

  const filters = {
    programId,
    search: search || undefined,
    category: category !== 'all' ? category : undefined,
    status: status !== 'all' ? status : undefined,
  };

  const { data: newsList, isLoading } = useNewsList(filters);
  const deleteNews = useDeleteNews();
  const publishNews = usePublishNews();

  const handleEdit = (id: string) => {
    router.push(`${basePath}/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
      await deleteNews.mutateAsync(id);
    }
  };

  const handlePublish = async (id: string) => {
    await publishNews.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Haberler</h2>
          <p className="text-sm text-muted-foreground">{newsList?.length || 0} haber bulundu</p>
        </div>
        {onCreateClick && (
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Haber
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Haber ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v as NewsCategory | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {Object.entries(NEWS_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as NewsStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(NEWS_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && newsList && newsList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Henüz haber bulunmuyor</p>
          {onCreateClick && (
            <Button onClick={onCreateClick} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              İlk Haberi Oluştur
            </Button>
          )}
        </div>
      )}

      {/* News Grid */}
      {!isLoading && newsList && newsList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              onEdit={showActions ? handleEdit : undefined}
              onDelete={showActions ? handleDelete : undefined}
              onPublish={showActions ? handlePublish : undefined}
              showActions={showActions}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
