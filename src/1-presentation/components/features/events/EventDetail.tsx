'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Separator } from '@/presentation/components/ui/atoms/separator';
import { useEvent } from '@/shared/hooks/api/useEvents';
import {
  formatEventDate,
  formatTimeRange,
  getRelativeTimeString,
} from '@/shared/utils/calendar.utils';
import { Loader2 } from 'lucide-react';
import type { EventResponseDto } from '@/application/dto/event';
import { AttendeeList } from './AttendeeList';
import { EventStatistics } from './EventStatistics';

interface EventDetailProps {
  eventId: string;
  onEdit?: (event: EventResponseDto) => void;
  onDelete?: (eventId: string) => void;
  onRegisterAttendance?: () => void;
  showActions?: boolean;
}

export function EventDetail({
  eventId,
  onEdit,
  onDelete,
  onRegisterAttendance,
  showActions = true,
}: EventDetailProps) {
  const { data, isLoading, error } = useEvent(eventId);
  const [isRegistering, setIsRegistering] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.event) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-destructive">{(error as Error)?.message || 'Etkinlik bulunamadı'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const event = data.event;

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

  const handleRegisterAttendance = async () => {
    if (!onRegisterAttendance) return;

    try {
      setIsRegistering(true);
      await onRegisterAttendance();
    } catch (error) {
      console.error('Failed to register attendance:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{event.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge {...getCategoryBadge(event.category)}>
                  {getCategoryBadge(event.category).label}
                </Badge>
                <Badge {...getStatusBadge(event.status)}>
                  {getStatusBadge(event.status).label}
                </Badge>
                {event.isPublic && <Badge variant="outline">Herkese Açık</Badge>}
              </div>
            </div>
            {showActions && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </Button>
                )}
                {onDelete && (
                  <Button variant="outline" size="sm" onClick={() => onDelete(event.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {event.description && (
            <div className="mb-6">
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <Separator className="my-6" />

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tarih</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventDate(new Date(event.startTime))}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Saat</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeRange(new Date(event.startTime), new Date(event.endTime))}
                  </p>
                </div>
              </div>

              {event.organizerName && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Organizatör</p>
                    <p className="text-sm text-muted-foreground">{event.organizerName}</p>
                    {event.organizerEmail && (
                      <p className="text-sm text-muted-foreground">{event.organizerEmail}</p>
                    )}
                  </div>
                </div>
              )}

              {event.attendanceRequired && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Katılımcılar</p>
                    <p className="text-sm text-muted-foreground">
                      {event.currentAttendees}
                      {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} katılımcı
                      {event.maxAttendees && event.currentAttendees >= event.maxAttendees && (
                        <Badge variant="destructive" className="ml-2">
                          Dolu
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {event.zoomJoinUrl && (
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Zoom Meeting</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(event.zoomJoinUrl!, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Zoom&apos;a Katıl
                    </Button>
                    {event.zoomPassword && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Şifre:{' '}
                        <code className="bg-muted px-1 py-0.5 rounded">{event.zoomPassword}</code>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Zaman Dilimi</p>
                  <p className="text-sm text-muted-foreground">{event.timezone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Durum</p>
                  <p className="text-sm text-muted-foreground">
                    {getRelativeTimeString(new Date(event.startTime))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Register Attendance Button */}
          {onRegisterAttendance && event.attendanceRequired && event.status === 'scheduled' && (
            <>
              <Separator className="my-6" />
              <div className="flex justify-center">
                <Button
                  onClick={handleRegisterAttendance}
                  disabled={isRegistering}
                  className="w-full md:w-auto"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Etkinliğe Katıl
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {event.attendanceRequired && event.status !== 'draft' && (
        <EventStatistics eventId={eventId} />
      )}

      {/* Attendees List */}
      {event.attendanceRequired && <AttendeeList eventId={eventId} showCompany={true} />}
    </div>
  );
}
