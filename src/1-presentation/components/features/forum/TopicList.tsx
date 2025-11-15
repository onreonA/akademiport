'use client';

import { useState } from 'react';
import { useTopicsList, useDeleteTopic } from '@/1-presentation/hooks/useForum';
import { TopicCard } from './TopicCard';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/atoms/select';
import { TopicStatus, TopicPriority, TOPIC_STATUS_LABELS, TOPIC_PRIORITY_LABELS } from '@/3-domain/enums/ForumEnums';
import { TopicFilterDto } from '@/2-application/dtos/forum';
import { Loader2, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';

interface TopicListProps {
  programId?: string;
  categoryId?: string;
  showActions?: boolean;
  basePath?: string;
  onCreateClick?: () => void;
}

export function TopicList({
  programId,
  categoryId,
  showActions = false,
  basePath = '/forum',
  onCreateClick,
}: TopicListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TopicStatus | 'all'>('all');
  const [priority, setPriority] = useState<TopicPriority | 'all'>('all');
  const [page, setPage] = useState(1);

  const filters: TopicFilterDto = {
    programId,
    categoryId,
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    priority: priority !== 'all' ? priority : undefined,
    page,
    limit: 20,
    sortBy: 'lastReplyAt',
    sortOrder: 'desc',
  };

  const { data, isLoading } = useTopicsList(filters);
  const deleteTopic = useDeleteTopic();

  const handleEdit = (id: string) => {
    router.push(`${basePath}/topics/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu konuyu silmek istediğinizden emin misiniz?')) {
      await deleteTopic.mutateAsync(id);
    }
  };

  const topics = data?.topics || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Forum Konuları</h2>
          <p className="text-sm text-muted-foreground">
            {total} konu bulundu
          </p>
        </div>
        {onCreateClick && (
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Konu
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Konu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as TopicStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(TOPIC_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => setPriority(v as TopicPriority | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Öncelikler</SelectItem>
            {Object.entries(TOPIC_PRIORITY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topics List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Henüz konu bulunmuyor.</p>
          {onCreateClick && (
            <Button onClick={onCreateClick} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              İlk Konuyu Oluştur
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onEdit={showActions ? handleEdit : undefined}
                onDelete={showActions ? handleDelete : undefined}
                basePath={basePath}
                showActions={showActions}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Önceki
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Sayfa {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

