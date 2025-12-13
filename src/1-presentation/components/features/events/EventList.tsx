'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Plus,
  Filter,
  Search,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { useEvents } from '@/shared/hooks/api/useEvents';
import {
  formatEventDate,
  formatTimeRange,
  getRelativeTimeString,
} from '@/shared/utils/calendar.utils';
import type { EventResponseDto } from '@/application/dto/event';
import { Pagination } from '@/presentation/components/ui/molecules/pagination';

interface EventListProps {
  programId?: string;
  consultantId?: string;
  onEventClick?: (event: EventResponseDto) => void;
  onCreateEvent?: () => void;
  showCreateButton?: boolean;
}

export function EventList({
  programId,
  consultantId,
  onEventClick,
  onCreateEvent,
  showCreateButton = true,
}: EventListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filters = useMemo(
    () => ({
      programId: programId || null,
      consultantId: consultantId || null,
      category:
        categoryFilter !== 'all'
          ? (categoryFilter as 'webinar' | 'workshop' | 'networking' | 'announcement' | 'other')
          : undefined,
      status:
        statusFilter !== 'all'
          ? (statusFilter as 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled')
          : undefined,
      search: search || undefined,
      page,
      limit: 12,
    }),
    [programId, consultantId, categoryFilter, statusFilter, search, page]
  );

  const { data, isLoading, error, refetch } = useEvents(filters);

  const events = data?.events || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  };

  const handleEventClick = (event: EventResponseDto) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
    > = {
      webinar: { label: 'Webinar', variant: 'default' },
      workshop: { label: 'Workshop', variant: 'secondary' },
      networking: { label: 'Networking', variant: 'outline' },
      announcement: { label: 'Duyuru', variant: 'outline' },
      other: { label: 'Diğer', variant: 'outline' },
    };
    return badges[category] || badges.other;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
    > = {
      draft: { label: 'Taslak', variant: 'outline' },
      scheduled: { label: 'Planlanmış', variant: 'default' },
      ongoing: { label: 'Devam Ediyor', variant: 'secondary' },
      completed: { label: 'Tamamlanmış', variant: 'outline' },
      cancelled: { label: 'İptal Edilmiş', variant: 'destructive' },
    };
    return badges[status] || badges.draft;
  };

  const getEventGradient = (category: string) => {
    const gradients: Record<string, string> = {
      webinar: 'from-blue-500 to-blue-600',
      workshop: 'from-purple-500 to-purple-600',
      networking: 'from-green-500 to-green-600',
      announcement: 'from-orange-500 to-orange-600',
      other: 'from-gray-500 to-gray-600',
    };
    return gradients[category] || gradients.other;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Etkinlikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Etkinlikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{(error as Error).message}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Etkinlikler</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {pagination.total} {pagination.total === 1 ? 'etkinlik' : 'etkinlik'}
              </p>
            </div>
            {showCreateButton && onCreateEvent && (
              <Button onClick={onCreateEvent}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Etkinlik
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Sol taraf - Filtreler */}
              <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  <span>Filtreler:</span>
                </div>

                <div className="flex-1 lg:flex-initial relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Etkinlik ara..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Tüm Kategoriler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="announcement">Duyuru</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Tüm Durumlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="scheduled">Planlanmış</SelectItem>
                    <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlanmış</SelectItem>
                    <SelectItem value="cancelled">İptal Edilmiş</SelectItem>
                  </SelectContent>
                </Select>

                {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setCategoryFilter('all');
                      setStatusFilter('all');
                      setPage(1);
                    }}
                    className="text-xs h-9"
                  >
                    <X className="w-3 h-3 mr-1.5" />
                    Filtreleri Temizle
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event List */}
      {events.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {search || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Etkinlik bulunamadı'
                : 'Henüz etkinlik yok'}
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {search || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Filtrelerinizi değiştirerek tekrar deneyin'
                : 'Programınıza ait etkinlikler burada görünecektir. Yeni etkinlikler eklendiğinde bildirim alacaksınız.'}
            </p>
            {search || categoryFilter !== 'all' || statusFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Filtreleri Temizle
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Yakında yeni etkinlikler eklenecek</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
              onClick={() => handleEventClick(event)}
            >
              {/* Üst renkli şerit */}
              <div className={`h-1.5 bg-gradient-to-r ${getEventGradient(event.category)}`} />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge {...getCategoryBadge(event.category)} className="text-xs">
                        {getCategoryBadge(event.category).label}
                      </Badge>
                      <Badge {...getStatusBadge(event.status)} className="text-xs">
                        {getStatusBadge(event.status).label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Açıklama */}
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Meta bilgiler */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{formatEventDate(new Date(event.startTime))}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {formatTimeRange(new Date(event.startTime), new Date(event.endTime))}
                      </span>
                    </div>
                    {event.maxAttendees && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {event.currentAttendees || 0} / {event.maxAttendees} katılımcı
                        </span>
                      </div>
                    )}
                    {event.zoomJoinUrl && (
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium">Zoom Meeting</span>
                      </Badge>
                    )}
                  </div>

                  {/* Alt kısım - Tarih badge ve relative time */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-2 border border-primary/20">
                      <div className="text-xl font-bold text-primary">
                        {new Date(event.startTime).getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase leading-tight">
                        {new Date(event.startTime).toLocaleDateString('tr-TR', { month: 'short' })}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTimeString(new Date(event.startTime))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
