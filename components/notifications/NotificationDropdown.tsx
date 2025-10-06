'use client';
import { useState, useEffect } from 'react';
interface Notification {
  id: string;
  event_id: string;
  type: 'reminder' | 'participation' | 'update' | 'announcement';
  title: string;
  message: string;
  user_email: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}
interface NotificationDropdownProps {
  userEmail: string;
  className?: string;
}
export default function NotificationDropdown({
  userEmail,
  className = '',
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Bildirimleri getir
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'X-User-Email': userEmail,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data.notifications);
          setUnreadCount(result.data.unread_count);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'X-User-Email': userEmail,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // Bildirim listesini güncelle
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {}
  };
  // Bildirimi sil
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': userEmail,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // Bildirim listesinden kaldır
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Eğer okunmamışsa sayacı güncelle
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {}
  };
  // Bildirim türüne göre ikon getir
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'ri-time-line text-orange-500';
      case 'participation':
        return 'ri-user-add-line text-green-500';
      case 'update':
        return 'ri-notification-line text-blue-500';
      case 'announcement':
        return 'ri-megaphone-line text-purple-500';
      default:
        return 'ri-notification-line text-gray-500';
    }
  };
  // Bildirim türüne göre renk getir
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'border-l-orange-500 bg-orange-50';
      case 'participation':
        return 'border-l-green-500 bg-green-50';
      case 'update':
        return 'border-l-blue-500 bg-blue-50';
      case 'announcement':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };
  // Zaman formatı
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };
  useEffect(() => {
    fetchNotifications();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userEmail]);
  return (
    <div className={`relative ${className}`}>
      {/* Bildirim Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
      >
        <i className='ri-notification-3-line text-xl'></i>
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {/* Bildirim Dropdown */}
      {isOpen && (
        <div className='absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
          <div className='p-4 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-gray-900'>Bildirimler</h3>
              {unreadCount > 0 && (
                <span className='text-sm text-gray-500'>
                  {unreadCount} okunmamış
                </span>
              )}
            </div>
          </div>
          <div className='max-h-96 overflow-y-auto'>
            {loading ? (
              <div className='p-4 text-center'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto'></div>
                <p className='text-sm text-gray-500 mt-2'>
                  Bildirimler yükleniyor...
                </p>
              </div>
            ) : notifications.length > 0 ? (
              <div className='divide-y divide-gray-100'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      <div
                        className={`text-lg ${getNotificationIcon(notification.type)}`}
                      ></div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between'>
                          <h4 className='text-sm font-medium text-gray-900 truncate'>
                            {notification.title}
                          </h4>
                          <div className='flex items-center gap-1'>
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className='text-gray-400 hover:text-gray-600 p-1'
                              title='Okundu olarak işaretle'
                            >
                              <i className='ri-check-line text-sm'></i>
                            </button>
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className='text-gray-400 hover:text-red-600 p-1'
                              title='Bildirimi sil'
                            >
                              <i className='ri-delete-bin-line text-sm'></i>
                            </button>
                          </div>
                        </div>
                        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                          {notification.message}
                        </p>
                        <p className='text-xs text-gray-500 mt-2'>
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-8 text-center'>
                <i className='ri-notification-off-line text-3xl text-gray-400 mb-2'></i>
                <p className='text-gray-500'>Henüz bildirim bulunmuyor</p>
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className='p-3 border-t border-gray-100'>
              <button
                onClick={() => {
                  // Tüm bildirimleri okundu olarak işaretle
                  notifications.forEach(n => {
                    if (!n.is_read) {
                      markAsRead(n.id);
                    }
                  });
                }}
                className='w-full text-sm text-blue-600 hover:text-blue-800 font-medium'
              >
                Tümünü okundu olarak işaretle
              </button>
            </div>
          )}
        </div>
      )}
      {/* Dropdown dışına tıklandığında kapat */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
