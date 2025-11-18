/**
 * Media Gallery Component
 * Sprint 23: CMS
 */

'use client';

import { useState } from 'react';
import { useCMSMedia, useDeleteCMSMedia, CMSMediaFilter } from '@/1-presentation/hooks/useCMS';
import { CMSMedia } from '@/3-domain/entities/CMSMedia';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Loader2, Search, Trash2, Image as ImageIcon, Video, File } from 'lucide-react';
import { toast } from 'sonner';
// Image will be rendered as regular img tag for dynamic URLs

interface MediaGalleryProps {
  onSelect?: (media: CMSMedia) => void;
  showActions?: boolean;
}

export function MediaGallery({ onSelect, showActions = true }: MediaGalleryProps) {
  const [search, setSearch] = useState('');
  const [mimeType, setMimeType] = useState<string>('all');

  const filter: CMSMediaFilter = {
    search: search || undefined,
    mimeType: mimeType !== 'all' ? mimeType : undefined,
  };

  const { data: mediaList, isLoading } = useCMSMedia(filter);
  const deleteMedia = useDeleteCMSMedia();

  const handleDelete = async (id: string) => {
    if (confirm('Bu medyayı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMedia.mutateAsync(id);
        toast.success('Medya silindi');
      } catch (error: any) {
        toast.error(error.message || 'Medya silinemedi');
      }
    }
  };

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Video;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Medya ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={mimeType} onValueChange={setMimeType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Tip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Tipler</SelectItem>
            <SelectItem value="image/">Görseller</SelectItem>
            <SelectItem value="video/">Videolar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Media Grid */}
      {!mediaList || mediaList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Henüz medya bulunmuyor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((media) => {
            const Icon = getMediaIcon(media.mimeType);
            const isImage = media.mimeType.startsWith('image/');

            return (
              <Card
                key={media.id}
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelect && onSelect(media)}
              >
                <CardContent className="p-2">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
                    {isImage ? (
                      <img
                        src={media.fileUrl}
                        alt={media.altText || media.originalFilename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {showActions && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(media.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium truncate" title={media.originalFilename}>
                      {media.originalFilename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(media.fileSize)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
