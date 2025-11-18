/**
 * CMS Page List Component
 * Sprint 23: CMS
 */

'use client';

import { useState } from 'react';
import { useCMSPages, useDeleteCMSPage, CMSPageFilter } from '@/1-presentation/hooks/useCMS';
import { CMSPage, CMSPageStatus } from '@/3-domain/entities/CMSPage';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Loader2, Plus, Search, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface CMSPageListProps {
  showActions?: boolean;
  basePath?: string;
  onCreateClick?: () => void;
}

const STATUS_LABELS: Record<CMSPageStatus, string> = {
  draft: 'Taslak',
  published: 'Yayınlandı',
  archived: 'Arşivlendi',
};

const STATUS_COLORS: Record<CMSPageStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function CMSPageList({
  showActions = false,
  basePath = '/dashboard/cms/pages',
  onCreateClick,
}: CMSPageListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CMSPageStatus | 'all'>('all');

  const filter: CMSPageFilter = {
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
  };

  const { data: pages, isLoading } = useCMSPages(filter);
  const deletePage = useDeleteCMSPage();

  const handleEdit = (id: string) => {
    router.push(`${basePath}/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu sayfayı silmek (arşivlemek) istediğinizden emin misiniz?')) {
      try {
        await deletePage.mutateAsync(id);
        toast.success('Sayfa arşivlendi');
      } catch (error) {
        toast.error('Sayfa silinemedi');
      }
    }
  };

  const handleView = (slug: string) => {
    window.open(`/${slug}`, '_blank');
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
          <h2 className="text-2xl font-bold">CMS Sayfaları</h2>
          <p className="text-sm text-muted-foreground">{pages?.length || 0} sayfa bulundu</p>
        </div>
        {onCreateClick && (
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sayfa
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sayfa ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as CMSPageStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pages List */}
      {!pages || pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Henüz sayfa bulunmuyor</p>
            {onCreateClick && (
              <Button onClick={onCreateClick} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                İlk Sayfayı Oluştur
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={STATUS_COLORS[page.status]}>
                        {STATUS_LABELS[page.status]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">/{page.slug}</span>
                    </div>
                  </div>
                  {showActions && (
                    <div className="flex items-center gap-2">
                      {page.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleView(page.slug)}
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(page.id)}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(page.id)}
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {page.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(page.publishedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                  {page.metaTitle && <span className="truncate max-w-md">{page.metaTitle}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
