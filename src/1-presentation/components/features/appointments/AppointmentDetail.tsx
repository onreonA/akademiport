'use client';

import {
  Calendar,
  Clock,
  Building2,
  User,
  Video,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { useAppointment } from '@/shared/hooks/api/useAppointments';
import { formatEventDate, formatTimeRange } from '@/shared/utils/calendar.utils';
import type { AppointmentResponseDto } from '@/application/dto/appointment';
import { AppointmentStatusLabels } from '@/domain/enums/AppointmentStatus';
import { AppointmentActions } from './AppointmentActions';

interface AppointmentDetailProps {
  appointmentId: string;
  onClose?: () => void;
}

export function AppointmentDetail({ appointmentId, onClose }: AppointmentDetailProps) {
  const { data, isLoading, error } = useAppointment(appointmentId);

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

  if (error || !data?.appointment) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive">{(error as Error)?.message || 'Randevu yüklenemedi'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const appointment: AppointmentResponseDto = data.appointment;

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive',
      completed: 'secondary',
      cancelled: 'destructive',
    };

    return {
      label: AppointmentStatusLabels[status as keyof typeof AppointmentStatusLabels] || status,
      variant: colorMap[status] || 'outline',
    };
  };

  const statusBadge = getStatusBadge(appointment.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{appointment.title}</CardTitle>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              {appointment.description && (
                <p className="text-muted-foreground mt-2">{appointment.description}</p>
              )}
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <XCircle className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatEventDate(new Date(appointment.startTime))}
                </p>
                <p className="text-xs text-muted-foreground">Tarih</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatTimeRange(new Date(appointment.startTime), new Date(appointment.endTime))}
                </p>
                <p className="text-xs text-muted-foreground">Saat</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Firma ID: {appointment.companyId.slice(0, 8)}...
                </p>
                <p className="text-xs text-muted-foreground">Firma</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {appointment.createdAt
                    ? formatEventDate(new Date(appointment.createdAt))
                    : 'Bilinmiyor'}
                </p>
                <p className="text-xs text-muted-foreground">Talep Tarihi</p>
              </div>
            </div>
          </div>

          {appointment.zoomJoinUrl && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-primary" />
                <span className="font-medium">Zoom Meeting</span>
              </div>
              <a
                href={appointment.zoomJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {appointment.zoomJoinUrl}
              </a>
              {appointment.zoomPassword && (
                <p className="text-xs text-muted-foreground mt-1">
                  Şifre: {appointment.zoomPassword}
                </p>
              )}
            </div>
          )}

          {appointment.rejectionReason && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">Red Nedeni</span>
              </div>
              <p className="text-sm">{appointment.rejectionReason}</p>
            </div>
          )}

          {(appointment.consultantNotes || appointment.companyNotes) && (
            <div className="mt-4 space-y-3">
              {appointment.consultantNotes && (
                <div className="p-4 bg-muted rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Danışman Notları</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{appointment.consultantNotes}</p>
                </div>
              )}

              {appointment.companyNotes && (
                <div className="p-4 bg-muted rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Firma Notları</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{appointment.companyNotes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <AppointmentActions appointment={appointment} />
    </div>
  );
}
