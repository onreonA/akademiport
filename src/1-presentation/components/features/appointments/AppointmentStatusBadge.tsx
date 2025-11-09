'use client';

import { Badge } from '@/presentation/components/ui/atoms/badge';
import { AppointmentStatusLabels } from '@/domain/enums/AppointmentStatus';
import type { AppointmentStatus } from '@/domain/enums/AppointmentStatus';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const colorMap: Record<AppointmentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'outline',
    approved: 'default',
    rejected: 'destructive',
    completed: 'secondary',
    cancelled: 'destructive',
  };

  return (
    <Badge variant={colorMap[status]} className={className}>
      {AppointmentStatusLabels[status]}
    </Badge>
  );
}
