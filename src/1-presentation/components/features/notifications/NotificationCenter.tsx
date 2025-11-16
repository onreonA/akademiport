/**
 * Notification Center Component
 *
 * Main notification dropdown/panel component
 */

'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/1-presentation/components/ui/atoms/dropdown-menu';
import { ScrollArea } from '@/1-presentation/components/ui/atoms/scroll-area';
import { Separator } from '@/1-presentation/components/ui/atoms/separator';
import { NotificationBadge } from './NotificationBadge';
import { NotificationItem } from './NotificationItem';
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
} from '@/1-presentation/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/5-shared/utils/cn';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    data: notifications,
    isLoading,
    refetch,
  } = useNotifications({
    limit: 20,
    enabled: open, // Only fetch when dropdown is open
  });
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
      refetch();
    } catch (error) {
      toast.error('Bildirimler işaretlenemedi');
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push('/notifications');
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">Bildirimler</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="h-8 text-xs"
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Tümünü okundu işaretle
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                router.push('/settings/notifications');
              }}
              className="h-8 w-8 p-0"
              title="Bildirim ayarları"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Bildirim yok</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={refetch}
                  onDelete={refetch}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications && notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full" onClick={handleViewAll}>
                Tümünü Gör
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
