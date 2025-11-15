'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, Users, Video, MapPin, Plus, Filter, Search, Loader2 } from 'lucide-react';
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
      category: categoryFilter !== 'all' ? (categoryFilter as 'webinar' | 'workshop' | 'networking' | 'announcement' | 'other') : undefined,
      status: statusFilter !== 'all' ? (statusFilter as 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled') : undefined,
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori" />
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="scheduled">Planlanmış</SelectItem>
                <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlanmış</SelectItem>
                <SelectItem value="cancelled">İptal Edilmiş</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Event List */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Etkinlik bulunamadı</p>
              <p className="text-sm text-muted-foreground">
                {search || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Filtrelerinizi değiştirerek tekrar deneyin'
                  : 'Henüz etkinlik oluşturulmamış'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleEventClick(event)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{event.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge {...getCategoryBadge(event.category)}>
                        {getCategoryBadge(event.category).label}
                      </Badge>
                      <Badge {...getStatusBadge(event.status)}>
                        {getStatusBadge(event.status).label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatEventDate(new Date(event.startTime))}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {formatTimeRange(new Date(event.startTime), new Date(event.endTime))}
                      </span>
                    </div>
                    {event.organizerName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.organizerName}</span>
                      </div>
                    )}
                    {event.zoomJoinUrl && (
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <span className="text-primary">Zoom linki mevcut</span>
                      </div>
                    )}
                    {event.attendanceRequired && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {event.currentAttendees}
                          {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} katılımcı
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
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
