/**
 * Notification Toast Component
 *
 * Toast notification component for displaying new notifications
 */

'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Notification } from '@/3-domain/entities/Notification';
import { NotificationType, NotificationPriority } from '@/3-domain/enums/NotificationEnums';
import { useRouter } from 'next/navigation';

interface NotificationToastProps {
  notification: Notification;
  onAction?: () => void;
}

export function NotificationToast({ notification, onAction }: NotificationToastProps) {
  const router = useRouter();

  useEffect(() => {
    const handleClick = () => {
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
      onAction?.();
    };

    // Determine toast variant based on priority
    const variant =
      notification.priority === NotificationPriority.URGENT
        ? 'error'
        : notification.priority === NotificationPriority.HIGH
          ? 'warning'
          : notification.type === NotificationType.SUCCESS
            ? 'success'
            : 'info';

    // Get icon based on notification type
    const getIcon = (type: NotificationType): string => {
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

    const icon = getIcon(notification.type);

    // Show toast
    toast[variant](notification.title, {
      description: notification.message,
      icon: <span className="text-lg">{icon}</span>,
      action: notification.actionUrl
        ? {
            label: 'Aç',
            onClick: handleClick,
          }
        : undefined,
      duration: notification.priority === NotificationPriority.URGENT ? 10000 : 5000,
    });
  }, [notification, router, onAction]);

  return null;
}
