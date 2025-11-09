'use client';

import { Users, Building2, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/atoms/avatar';
import { Loader2 } from 'lucide-react';
import { useEventAttendees } from '@/shared/hooks/api/useEventAttendees';
import { formatEventDate } from '@/shared/utils/calendar.utils';

interface AttendeeListProps {
  eventId: string;
  showCompany?: boolean;
}

export function AttendeeList({ eventId, showCompany = true }: AttendeeListProps) {
  const { data, isLoading, error } = useEventAttendees(eventId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Katılımcılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Katılımcılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {(error as Error)?.message || 'Katılımcılar yüklenemedi'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const attendees = data?.attendees || [];

  if (attendees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Katılımcılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium mb-1">Henüz katılımcı yok</p>
            <p className="text-xs text-muted-foreground">Bu etkinliğe henüz kimse kayıt olmamış</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Katılımcılar ({attendees.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attendees.map((attendee) => (
            <div
              key={attendee.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {attendee.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attendee.userName}</p>
                    {showCompany && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">
                          {attendee.companyName}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {attendee.attendedAt ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Katıldı
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Kayıtlı
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatEventDate(new Date(attendee.registeredAt))}</span>
                  </div>
                  {attendee.attendedAt && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{formatEventDate(new Date(attendee.attendedAt))}</span>
                    </div>
                  )}
                </div>

                {attendee.notes && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                    <p className="line-clamp-2">{attendee.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
