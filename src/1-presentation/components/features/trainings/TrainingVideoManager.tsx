'use client';

/**
 * Training Video Manager Component
 *
 * Component for managing training videos (list, add, edit, delete)
 * Features:
 * - Drag & drop reordering
 * - Statistics and summary cards
 * - Enhanced empty state
 * - Video preview modal
 * - Grid/List view toggle
 * - Search and filtering
 * - Animations and transitions
 * - Bulk operations
 * - Visual hierarchy improvements
 */

import * as React from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Video,
  Lock,
  Play,
  GripVertical,
  Clock,
  BarChart3,
  Eye,
  Search,
  Grid3x3,
  List,
  Filter,
  X,
  CheckSquare,
  Square,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/atoms/dropdown-menu';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Checkbox } from '@/presentation/components/ui/atoms/checkbox';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { toast } from 'sonner';
import type { TrainingVideo } from '@/domain/entities/TrainingVideo';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

interface TrainingVideoManagerProps {
  trainingId: string;
  videos: TrainingVideo[];
  onRefresh: () => void;
}

type ViewMode = 'list' | 'grid';
type FilterType = 'all' | 'locked' | 'unlocked';

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (youtubeUrl: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = youtubeUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Helper function to get YouTube thumbnail URL
const getYouTubeThumbnail = (youtubeUrl: string): string | null => {
  const videoId = extractYouTubeId(youtubeUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (youtubeUrl: string): string | null => {
  const videoId = extractYouTubeId(youtubeUrl);
  return videoId
    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${
        typeof window !== 'undefined' ? window.location.origin : ''
      }`
    : null;
};

// Helper function to format duration in seconds to human readable format
const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds || seconds === 0) return '';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to calculate total duration
const calculateTotalDuration = (videos: TrainingVideo[]): number => {
  return videos.reduce((total, video) => total + (video.durationSeconds || 0), 0);
};

// Sortable Video Item Component (List View)
interface SortableVideoItemProps {
  video: TrainingVideo;
  onEdit: (video: TrainingVideo) => void;
  onDelete: (videoId: string) => void;
  onPreview: (video: TrainingVideo) => void;
  isSelected?: boolean;
  onSelect?: (videoId: string, selected: boolean) => void;
  viewMode: ViewMode;
}

function SortableVideoItem({
  video,
  onEdit,
  onDelete,
  onPreview,
  isSelected = false,
  onSelect,
  viewMode,
}: SortableVideoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const thumbnailUrl = getYouTubeThumbnail(video.youtubeUrl);
  const duration = formatDuration(video.durationSeconds);

  if (viewMode === 'grid') {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`group relative ${isDragging ? 'ring-2 ring-primary z-50' : ''}`}
      >
        <Card
          className={`hover:shadow-lg transition-all duration-300 border overflow-hidden cursor-pointer ${
            isSelected
              ? 'ring-2 ring-primary border-primary'
              : 'border-gray-200 dark:border-gray-800'
          }`}
        >
          {/* Selection Checkbox */}
          {onSelect && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(video.id, checked === true)}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 shadow-md"
              />
            </div>
          )}

          {/* Thumbnail */}
          <div
            className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden group-hover:opacity-90 transition-opacity"
            onClick={() => onPreview(video)}
          >
            {thumbnailUrl ? (
              <>
                <img
                  src={thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    const videoId = extractYouTubeId(video.youtubeUrl);
                    if (videoId) {
                      e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-8 w-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <Video className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            {duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                {duration}
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
              {video.title}
            </h4>
            {video.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  #{video.orderIndex + 1}
                </Badge>
                {video.isLocked && (
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-500/20 text-orange-600 dark:text-orange-400"
                  >
                    <Lock className="mr-1 h-3 w-3" />
                    Kilitli
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPreview(video)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Önizle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(video)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(video.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // List View
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`hover:shadow-lg transition-all duration-300 border overflow-hidden ${
          isDragging ? 'ring-2 ring-primary' : ''
        } ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-gray-200 dark:border-gray-800'}`}
      >
        <CardContent className="p-0">
          <div className="flex gap-0">
            {/* Selection Checkbox */}
            {onSelect && (
              <div className="flex items-center justify-center w-12 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect(video.id, checked === true)}
                />
              </div>
            )}

            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-8 bg-gray-50 dark:bg-gray-800 cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>

            {/* Thumbnail Section */}
            <div
              className="relative w-48 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 overflow-hidden group cursor-pointer"
              onClick={() => onPreview(video)}
            >
              {thumbnailUrl ? (
                <>
                  <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      const videoId = extractYouTubeId(video.youtubeUrl);
                      if (videoId) {
                        e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <Video className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              {duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                  {duration}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h4 className="font-semibold text-base leading-tight line-clamp-2">
                      {video.title}
                    </h4>
                  </div>
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs font-medium">
                      #{video.orderIndex + 1}
                    </Badge>
                    {video.isLocked && (
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-500/20 text-orange-600 dark:text-orange-400"
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Kilitli
                      </Badge>
                    )}
                    {duration && (
                      <Badge variant="outline" className="text-xs">
                        <Video className="mr-1 h-3 w-3" />
                        {duration}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(video)}
                    className="h-8 w-8 p-0"
                    title="Önizle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(video)}
                    className="h-8 w-8 p-0"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(video.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TrainingVideoManager({
  trainingId,
  videos: initialVideos,
  onRefresh,
}: TrainingVideoManagerProps) {
  const [videos, setVideos] = React.useState<TrainingVideo[]>(initialVideos);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingVideo, setEditingVideo] = React.useState<TrainingVideo | null>(null);
  const [previewVideo, setPreviewVideo] = React.useState<TrainingVideo | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isReordering, setIsReordering] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<FilterType>('all');
  const [selectedVideos, setSelectedVideos] = React.useState<Set<string>>(new Set());
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    youtubeUrl: '',
    orderIndex: videos.length,
    isLocked: false,
  });
  const [isFetchingMetadata, setIsFetchingMetadata] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  // Filter and search videos
  const filteredVideos = React.useMemo(() => {
    let filtered = [...videos];

    // Apply filter
    if (filterType === 'locked') {
      filtered = filtered.filter((v) => v.isLocked);
    } else if (filterType === 'unlocked') {
      filtered = filtered.filter((v) => !v.isLocked);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) => v.title.toLowerCase().includes(query) || v.description?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [videos, filterType, searchQuery]);

  // Calculate statistics
  const totalVideos = videos.length;
  const totalDuration = calculateTotalDuration(videos);
  const lockedVideos = videos.filter((v) => v.isLocked).length;
  const averageDuration = totalVideos > 0 ? Math.round(totalDuration / totalVideos) : 0;

  const handleOpenAddModal = () => {
    const maxOrderIndex =
      videos.length > 0 ? Math.max(...videos.map((v) => v.orderIndex ?? 0)) : -1;
    const nextOrderIndex = maxOrderIndex + 1;

    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      orderIndex: nextOrderIndex,
      isLocked: false,
    });
    setEditingVideo(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (video: TrainingVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtubeUrl: video.youtubeUrl,
      orderIndex: video.orderIndex,
      isLocked: video.isLocked,
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingVideo(null);
    setIsFetchingMetadata(false);

    const maxOrderIndex =
      videos.length > 0 ? Math.max(...videos.map((v) => v.orderIndex ?? 0)) : -1;
    const nextOrderIndex = maxOrderIndex + 1;

    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      orderIndex: nextOrderIndex,
      isLocked: false,
    });
  };

  const handleFetchMetadata = async () => {
    if (!formData.youtubeUrl || editingVideo) return;

    const youtubeUrlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
    if (!youtubeUrlPattern.test(formData.youtubeUrl)) {
      return;
    }

    setIsFetchingMetadata(true);
    try {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      ];

      let youtubeId: string | null = null;
      for (const pattern of patterns) {
        const match = formData.youtubeUrl.match(pattern);
        if (match && match[1]) {
          youtubeId = match[1];
          break;
        }
      }

      if (!youtubeId) {
        setIsFetchingMetadata(false);
        return;
      }

      const response = await fetch(
        `/api/trainings/${trainingId}/videos/metadata?youtubeId=${youtubeId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.title || data.description) {
          setFormData((prev) => ({
            ...prev,
            title: prev.title || data.title || '',
            description: prev.description || data.description || '',
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch YouTube metadata:', error);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingVideo
        ? `/api/trainings/${trainingId}/videos/${editingVideo.id}`
        : `/api/trainings/${trainingId}/videos`;

      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          youtubeUrl: formData.youtubeUrl,
          orderIndex: formData.orderIndex,
          isLocked: formData.isLocked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video kaydedilemedi');
      }

      toast.success(editingVideo ? 'Video başarıyla güncellendi' : 'Video başarıyla eklendi');
      handleCloseModal();
      onRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Video kaydedilirken bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trainings/${trainingId}/videos/${videoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video silinemedi');
      }

      toast.success('Video başarıyla silindi');
      onRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Video silinirken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.size === 0) return;

    if (
      !confirm(
        `${selectedVideos.size} videoyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
      )
    ) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedVideos).map((videoId) =>
        fetch(`/api/trainings/${trainingId}/videos/${videoId}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedVideos.size} video başarıyla silindi`);
      setSelectedVideos(new Set());
      onRefresh();
    } catch (error) {
      toast.error('Videolar silinirken bir hata oluştu');
    }
  };

  const handleBulkLock = async (lock: boolean) => {
    if (selectedVideos.size === 0) return;

    try {
      const updatePromises = Array.from(selectedVideos).map((videoId) =>
        fetch(`/api/trainings/${trainingId}/videos/${videoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isLocked: lock,
          }),
        })
      );

      await Promise.all(updatePromises);
      toast.success(`${selectedVideos.size} video ${lock ? 'kilitlendi' : 'kilidi açıldı'}`);
      setSelectedVideos(new Set());
      onRefresh();
    } catch (error) {
      toast.error('Videolar güncellenirken bir hata oluştu');
    }
  };

  const handleSelectVideo = (videoId: string, selected: boolean) => {
    const newSelected = new Set(selectedVideos);
    if (selected) {
      newSelected.add(videoId);
    } else {
      newSelected.delete(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(filteredVideos.map((v) => v.id)));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || viewMode === 'grid') {
      return;
    }

    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistically update UI
    const newVideos = arrayMove(videos, oldIndex, newIndex);
    const updatedVideos = newVideos.map((video, index) => ({
      ...video,
      orderIndex: index,
    }));
    setVideos(updatedVideos);
    setIsReordering(true);

    try {
      // Update all affected videos' orderIndex
      const updatePromises = updatedVideos
        .slice(Math.min(oldIndex, newIndex), Math.max(oldIndex, newIndex) + 1)
        .map((video, idx) => {
          const actualIndex = Math.min(oldIndex, newIndex) + idx;
          return fetch(`/api/trainings/${trainingId}/videos/${video.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderIndex: actualIndex,
            }),
          });
        });

      await Promise.all(updatePromises);
      toast.success('Video sırası güncellendi');
      onRefresh();
    } catch (error) {
      // Revert on error
      setVideos(initialVideos);
      toast.error('Video sırası güncellenirken bir hata oluştu');
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Statistics Cards */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Toplam Video</p>
                  <p className="text-2xl font-bold">{totalVideos}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Toplam Süre</p>
                  <p className="text-2xl font-bold">{formatDuration(totalDuration) || '0:00'}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Kilitli Videolar</p>
                  <p className="text-2xl font-bold">{lockedVideos}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ortalama Süre</p>
                  <p className="text-2xl font-bold">{formatDuration(averageDuration) || '0:00'}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Header with Search, Filter, and View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1">Videolar</h3>
            <p className="text-sm text-muted-foreground">
              {filteredVideos.length} / {videos.length} video
              {totalDuration > 0 && ` · ${formatDuration(totalDuration)} toplam süre`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddModal} size="sm" className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Video Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingVideo ? 'Videoyu Düzenle' : 'Yeni Video Ekle'}</DialogTitle>
                  <DialogDescription>
                    YouTube video URL&apos;si ekleyin. Video unlisted olmalıdır.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Başlık *{' '}
                      <span className="text-xs text-muted-foreground">
                        (YouTube&apos;dan otomatik)
                      </span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Video başlığı (YouTube URL girildiğinde otomatik doldurulur)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Açıklama{' '}
                      <span className="text-xs text-muted-foreground">
                        (YouTube&apos;dan otomatik)
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Video açıklaması (YouTube URL girildiğinde otomatik doldurulur)"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="youtubeUrl"
                        type="url"
                        value={formData.youtubeUrl}
                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                        onBlur={handleFetchMetadata}
                        required
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1"
                      />
                      {isFetchingMetadata && (
                        <div className="flex items-center justify-center px-3">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      YouTube video URL&apos;si (watch, embed veya youtu.be formatı). URL
                      girildiğinde başlık ve açıklama otomatik doldurulur.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderIndex">Sıra</Label>
                    <Input
                      id="orderIndex"
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          orderIndex: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground">
                      Video sırası (0 = ilk video, daha yüksek sayı = daha sonra). Drag & drop ile
                      de sıralayabilirsiniz.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isLocked"
                      checked={formData.isLocked}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isLocked: checked === true })
                      }
                    />
                    <Label htmlFor="isLocked" className="text-sm font-normal cursor-pointer">
                      Kilitli (Önceki video tamamlanmadan bu video açılmaz)
                    </Label>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseModal}>
                      İptal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Kaydediliyor...' : editingVideo ? 'Güncelle' : 'Ekle'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search, Filter, and View Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Videolarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="locked">Kilitli</SelectItem>
                <SelectItem value="unlocked">Kilitli Değil</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0 border-l"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedVideos.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedVideos.size === filteredVideos.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">{selectedVideos.size} video seçildi</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkLock(true)}>
                <Lock className="mr-2 h-4 w-4" />
                Kilitle
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkLock(false)}>
                <Lock className="mr-2 h-4 w-4" />
                Kilidi Aç
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Videos List/Grid */}
      {filteredVideos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <CardContent className="py-20 text-center">
              <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center mb-6 shadow-lg">
                <Video className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {searchQuery || filterType !== 'all'
                  ? 'Video Bulunamadı'
                  : 'Henüz Video Eklenmemiş'}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base leading-relaxed">
                {searchQuery || filterType !== 'all'
                  ? 'Arama kriterlerinize uygun video bulunamadı. Filtreleri değiştirmeyi deneyin.'
                  : 'Bu eğitime video ekleyerek içeriği zenginleştirin. Videolar sıralı olarak gösterilecek ve drag & drop ile yeniden sıralanabilir.'}
              </p>
              {(searchQuery || filterType !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="mb-4"
                >
                  <X className="mr-2 h-4 w-4" />
                  Filtreleri Temizle
                </Button>
              )}
              {!searchQuery && filterType === 'all' && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleOpenAddModal} size="lg" className="shadow-md">
                    <Plus className="mr-2 h-5 w-5" />
                    İlk Videoyu Ekle
                  </Button>
                </div>
              )}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-muted-foreground">
                  💡 İpucu: YouTube URL&apos;si eklediğinizde başlık ve açıklama otomatik olarak
                  doldurulur.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {viewMode === 'list' ? (
            <SortableContext
              items={filteredVideos.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Checkbox
                    checked={
                      filteredVideos.length > 0 && selectedVideos.size === filteredVideos.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Tümünü seç ({filteredVideos.length} video)
                  </span>
                </div>
                <AnimatePresence mode="popLayout">
                  {filteredVideos.map((video) => (
                    <SortableVideoItem
                      key={video.id}
                      video={video}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDelete}
                      onPreview={setPreviewVideo}
                      isSelected={selectedVideos.has(video.id)}
                      onSelect={handleSelectVideo}
                      viewMode={viewMode}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          ) : (
            <SortableContext items={filteredVideos.map((v) => v.id)} strategy={rectSortingStrategy}>
              <div className="space-y-4">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Checkbox
                    checked={
                      filteredVideos.length > 0 && selectedVideos.size === filteredVideos.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Tümünü seç ({filteredVideos.length} video)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredVideos.map((video) => (
                      <SortableVideoItem
                        key={video.id}
                        video={video}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDelete}
                        onPreview={setPreviewVideo}
                        isSelected={selectedVideos.has(video.id)}
                        onSelect={handleSelectVideo}
                        viewMode={viewMode}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </SortableContext>
          )}
        </DndContext>
      )}

      {/* Video Preview Modal */}
      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="max-w-4xl">
          {previewVideo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <DialogHeader>
                <DialogTitle>{previewVideo.title}</DialogTitle>
                {previewVideo.description && (
                  <DialogDescription className="text-base">
                    {previewVideo.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {getYouTubeEmbedUrl(previewVideo.youtubeUrl) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(previewVideo.youtubeUrl) || ''}
                      title={previewVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <p>Video yüklenemedi</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">#{previewVideo.orderIndex + 1}</Badge>
                  {previewVideo.isLocked && (
                    <Badge
                      variant="outline"
                      className="border-orange-500/20 text-orange-600 dark:text-orange-400"
                    >
                      <Lock className="mr-1 h-3 w-3" />
                      Kilitli
                    </Badge>
                  )}
                  {previewVideo.durationSeconds && (
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDuration(previewVideo.durationSeconds)}
                    </Badge>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewVideo(null)}>
                  Kapat
                </Button>
                <Button
                  onClick={() => {
                    setPreviewVideo(null);
                    handleOpenEditModal(previewVideo);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
