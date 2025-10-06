'use client';
import { useEffect, useState } from 'react';
import {
  RiAlertLine,
  RiBellLine,
  RiCheckLine,
  RiFileLine,
  RiFolderLine,
  RiSettingsLine,
} from 'react-icons/ri';
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'assignment';
  category: 'project' | 'task' | 'system' | 'general';
  icon: string;
  color: string;
  data?: any;
  action_url?: string;
  priority: number;
  read_at?: string;
  created_at: string;
  updated_at: string;
}
interface NotificationsPanelProps {
  projectId: string;
}
export default function NotificationsPanel({
  projectId,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    fetchNotifications();
  }, [projectId]);
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=10');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unread_count || 0);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          notification_ids: [notificationId],
        }),
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {}
  };
  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(notif => !notif.read_at)
      .map(notif => notif.id);
    if (unreadIds.length === 0) return;
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          notification_ids: unreadIds,
        }),
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {}
  };
  const getIcon = (iconName: string, type: string) => {
    const iconProps = { className: 'w-5 h-5' };
    switch (iconName) {
      case 'RiProjectLine':
        return <RiFolderLine {...iconProps} />;
      case 'RiTaskLine':
        return <RiFileLine {...iconProps} />;
      case 'RiSettingsLine':
        return <RiSettingsLine {...iconProps} />;
      default:
        switch (type) {
          case 'info':
            return <RiBellLine {...iconProps} />;
          case 'warning':
            return <RiAlertLine {...iconProps} />;
          case 'error':
            return <RiAlertLine {...iconProps} />;
          case 'success':
            return <RiCheckLine {...iconProps} />;
          default:
            return <RiBellLine {...iconProps} />;
        }
    }
  };
  const getColorClasses = (color: string, type: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        switch (type) {
          case 'info':
            return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'warning':
            return 'bg-orange-100 text-orange-800 border-orange-200';
          case 'error':
            return 'bg-red-100 text-red-800 border-red-200';
          case 'success':
            return 'bg-green-100 text-green-800 border-green-200';
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };
  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='space-y-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='flex items-start space-x-3'>
                <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                <div className='flex-1'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
          <RiBellLine className='w-5 h-5 text-gray-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Bildirimler</h3>
          {unreadCount > 0 && (
            <span className='bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className='text-sm text-blue-600 hover:text-blue-700 font-medium'
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className='text-center py-8'>
          <RiBellLine className='w-12 h-12 text-gray-400 mx-auto mb-3' />
          <p className='text-gray-500'>Henüz bildirim bulunmuyor</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                notification.read_at
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-blue-200 shadow-sm'
              }`}
            >
              <div className='flex items-start space-x-3'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(notification.color, notification.type)}`}
                >
                  {getIcon(notification.icon, notification.type)}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4
                        className={`font-medium ${notification.read_at ? 'text-gray-600' : 'text-gray-900'}`}
                      >
                        {notification.title}
                      </h4>
                      <p
                        className={`text-sm mt-1 ${notification.read_at ? 'text-gray-500' : 'text-gray-700'}`}
                      >
                        {notification.message}
                      </p>
                      <div className='flex items-center space-x-2 mt-2'>
                        <span className='text-xs text-gray-500'>
                          {formatDate(notification.created_at)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getColorClasses(notification.color, notification.type)}`}
                        >
                          {notification.category === 'project'
                            ? 'Proje'
                            : notification.category === 'task'
                              ? 'Görev'
                              : notification.category === 'system'
                                ? 'Sistem'
                                : 'Genel'}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2 ml-3'>
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className='p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600'
                          title='Okundu işaretle'
                        >
                          <RiCheckLine className='w-4 h-4' />
                        </button>
                      )}
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                        >
                          Görüntüle →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
