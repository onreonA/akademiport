'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}
interface NotificationBellProps {
  userEmail: string;
}
export default function NotificationBell({ userEmail }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetchNotifications();
    // Her 30 saniyede bir bildirimleri güncelle
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userEmail]);
  useEffect(() => {
    // Dropdown dışına tıklandığında kapat
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=10', {
        headers: {
          'X-User-Email': userEmail,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({ status: 'read' }),
      });
      if (response.ok) {
        // Bildirimi yerel olarak güncelle
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {}
  };
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'ri-check-line text-green-600';
      case 'warning':
        return 'ri-alert-line text-yellow-600';
      case 'error':
        return 'ri-error-warning-line text-red-600';
      default:
        return 'ri-information-line text-gray-600';
    }
  };
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };
  return (
    <div className='relative' ref={dropdownRef}>
      {/* Bildirim Zili */}
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
        <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto'>
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Bildirimler
              </h3>
              {unreadCount > 0 && (
                <span className='text-sm text-gray-500'>
                  {unreadCount} okunmamış
                </span>
              )}
            </div>
          </div>
          <div className='divide-y divide-gray-200'>
            {loading ? (
              <div className='p-4 text-center'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto'></div>
                <p className='mt-2 text-sm text-gray-500'>Yükleniyor...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className='p-4 text-center'>
                <i className='ri-notification-off-line text-3xl text-gray-400 mb-2'></i>
                <p className='text-sm text-gray-500'>Henüz bildiriminiz yok</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 mt-1'>
                      <i
                        className={`${getNotificationIcon(notification.type)} text-lg`}
                      ></i>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2'></div>
                        )}
                      </div>
                      <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                        {notification.message}
                      </p>
                      <p className='text-xs text-gray-400 mt-2'>
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className='p-3 border-t border-gray-200'>
              <Link
                href='/notifications'
                className='block text-center text-sm text-blue-600 hover:text-blue-700 font-medium'
                onClick={() => setIsOpen(false)}
              >
                Tüm Bildirimleri Gör
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
