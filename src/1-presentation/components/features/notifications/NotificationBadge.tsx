/**
 * Notification Badge Component
 *
 * Displays unread notification count badge
 */

'use client';

import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { useUnreadNotificationCount } from '@/1-presentation/hooks/useNotifications';
import { cn } from '@/5-shared/utils/cn';

interface NotificationBadgeProps {
  className?: string;
  showZero?: boolean;
}

export function NotificationBadge({ className, showZero = false }: NotificationBadgeProps) {
  const { data: count, isLoading } = useUnreadNotificationCount();

  if (isLoading) {
    return null;
  }

  const unreadCount = count || 0;

  if (!showZero && unreadCount === 0) {
    return null;
  }

  return (
    <Badge
      variant={unreadCount > 0 ? 'destructive' : 'secondary'}
      className={cn(
        'ml-2 h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs',
        className
      )}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}
