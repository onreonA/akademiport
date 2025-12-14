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
  Loader2,
  CalendarDays,
  User,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { EnhancedCard } from '@/1-presentation/components/ui/atoms/enhanced-card';
import { GradientHeader } from '@/1-presentation/components/ui/molecules/gradient-header';
import { useEvent } from '@/5-shared/hooks/api/useEvents';
import {
  formatEventDate,
  formatTimeRange,
  getRelativeTimeString,
} from '@/5-shared/utils/calendar.utils';
import type { EventResponseDto } from '@/2-application/dto/event';
import { AttendeeList } from './AttendeeList';
import { EventStatistics } from './EventStatistics';
import { useAuth } from '@/5-shared/hooks/useAuth';

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
  const { user } = useAuth();

  // Check if user can mark attendance (consultant or admin)
  const canMarkAttendance =
    user && (user.role === 'consultant' || user.role === 'admin' || user.role === 'master_admin');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse bg-white/50 dark:bg-gray-800/50 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 animate-pulse bg-white/50 dark:bg-gray-800/50 rounded-xl" />
          <div className="h-64 animate-pulse bg-white/50 dark:bg-gray-800/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <EnhancedCard variant="glass" className="p-10 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Etkinlik Bulunamadı</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {(error as Error)?.message || 'İstediğiniz etkinlik bulunamadı.'}
        </p>
      </EnhancedCard>
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
      // Error already handled by parent
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GradientHeader
        icon={CalendarDays}
        title={event.title}
        subtitle={formatEventDate(new Date(event.startTime))}
        actions={
          showActions ? (
            <div className="flex flex-wrap gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(event)} className="gap-2">
                  <Edit className="w-4 h-4" />
                  Düzenle
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge {...getCategoryBadge(event.category)}>
          {getCategoryBadge(event.category).label}
        </Badge>
        <Badge {...getStatusBadge(event.status)}>{getStatusBadge(event.status).label}</Badge>
        {event.isPublic && <Badge variant="outline">Herkese Açık</Badge>}
      </div>

      {/* Main Content */}
      <EnhancedCard variant="glass" className="p-6">
        <div className="space-y-6">
          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Açıklama
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Event Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Etkinlik Detayları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tarih</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatEventDate(new Date(event.startTime))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Saat</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatTimeRange(new Date(event.startTime), new Date(event.endTime))}
                    </p>
                  </div>
                </div>

                {event.organizerName && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
                      <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Organizatör</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {event.organizerName}
                      </p>
                      {event.organizerEmail && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {event.organizerEmail}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {event.attendanceRequired && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
                      <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Katılımcılar</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {event.currentAttendees}
                        {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} katılımcı
                      </p>
                      {event.maxAttendees && event.currentAttendees >= event.maxAttendees && (
                        <Badge variant="destructive" className="mt-1">
                          Dolu
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {event.zoomJoinUrl ? (
                  <div className="p-4 bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                        <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Online Toplantı
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Zoom Meeting
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(event.zoomJoinUrl!, '_blank')}
                      className="w-full gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Zoom&apos;a Katıl
                    </Button>
                    {event.zoomPassword && (
                      <div className="mt-3 p-2 bg-white/50 dark:bg-gray-900/50 rounded text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Şifre</p>
                        <code className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {event.zoomPassword}
                        </code>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
                        <Video className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Zoom Meeting
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Bu etkinlik için Zoom meeting oluşturulmamış.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg shrink-0">
                    <MapPin className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Zaman Dilimi</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {event.timezone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg shrink-0">
                    <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Durum</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {getRelativeTimeString(new Date(event.startTime))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Register Attendance Button */}
      {onRegisterAttendance && event.attendanceRequired && event.status === 'scheduled' && (
        <EnhancedCard variant="glass" className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Etkinliğe Katılın
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bu etkinliğe katılmak için aşağıdaki butona tıklayın
              </p>
            </div>
            <Button
              onClick={handleRegisterAttendance}
              disabled={isRegistering}
              size="lg"
              className="w-full md:w-auto gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Etkinliğe Katıl
                </>
              )}
            </Button>
          </div>
        </EnhancedCard>
      )}

      {/* Statistics */}
      {event.attendanceRequired && event.status !== 'draft' && (
        <EventStatistics eventId={eventId} />
      )}

      {/* Attendees List */}
      {event.attendanceRequired && (
        <AttendeeList eventId={eventId} showCompany={true} canMarkAttendance={canMarkAttendance} />
      )}
    </div>
  );
}
