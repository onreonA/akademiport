/**
 * Notification Item Component
 *
 * Single notification item in the notification center
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Card } from '@/1-presentation/components/ui/atoms/card';
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { cn } from '@/5-shared/utils/cn';
import { NotificationType, NotificationPriority } from '@/3-domain/enums/NotificationEnums';
import {
  getNotificationTypeLabel,
  getNotificationPriorityLabel,
} from '@/3-domain/enums/NotificationEnums';
import {
  useMarkNotificationAsRead,
  useDeleteNotification,
} from '@/1-presentation/hooks/useNotifications';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    priority: string;
    isRead: boolean;
    createdAt: string;
  };
  onMarkAsRead?: () => void;
  onDelete?: () => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter();
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkAsRead = async () => {
    try {
      await markAsReadMutation.mutateAsync(notification.id);
      onMarkAsRead?.();
    } catch (error) {
      toast.error('Bildirim okundu olarak işaretlenemedi');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(notification.id);
      onDelete?.();
      toast.success('Bildirim silindi');
    } catch (error) {
      toast.error('Bildirim silinemedi');
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      handleMarkAsRead();
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const priorityColor =
    {
      [NotificationPriority.LOW]: 'bg-gray-100 text-gray-800',
      [NotificationPriority.NORMAL]: 'bg-blue-100 text-blue-800',
      [NotificationPriority.HIGH]: 'bg-orange-100 text-orange-800',
      [NotificationPriority.URGENT]: 'bg-red-100 text-red-800',
    }[notification.priority as NotificationPriority] || 'bg-gray-100 text-gray-800';

  const getTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      [NotificationType.INFO]: 'ℹ️',
      [NotificationType.SUCCESS]: '✅',
      [NotificationType.WARNING]: '⚠️',
      [NotificationType.ERROR]: '❌',
      [NotificationType.TASK_ASSIGNED]: '📋',
      [NotificationType.TASK_COMPLETED]: '✅',
      [NotificationType.EVENT_REMINDER]: '📅',
      [NotificationType.APPOINTMENT_CONFIRMED]: '📞',
      [NotificationType.APPOINTMENT_CANCELLED]: '❌',
      [NotificationType.BADGE_EARNED]: '🏆',
      [NotificationType.ECOMMERCE_METRICS_REMINDER]: '📊',
      [NotificationType.FORUM_REPLY]: '💬',
    };
    return iconMap[type] || '🔔';
  };

  const typeIcon = getTypeIcon(notification.type);

  return (
    <Card
      className={cn(
        'group relative p-4 transition-colors hover:bg-accent',
        !notification.isRead && 'bg-blue-50/50 border-blue-200'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-lg">
            {typeIcon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn('text-sm font-medium', !notification.isRead && 'font-semibold')}>
                  {notification.title}
                </h4>
                <Badge variant="outline" className={cn('text-xs', priorityColor)}>
                  {getNotificationPriorityLabel(notification.priority as NotificationPriority)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
                {notification.actionUrl && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Bağlantı
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead();
                  }}
                  title="Okundu olarak işaretle"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                title="Sil"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
