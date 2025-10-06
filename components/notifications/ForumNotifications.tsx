'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
interface ForumNotification {
  id: string;
  type:
    | 'topic_reply'
    | 'topic_like'
    | 'reply_like'
    | 'topic_mention'
    | 'reply_mention'
    | 'topic_solved'
    | 'topic_featured';
  title: string;
  message: string;
  topic_id?: string;
  reply_id?: string;
  from_user_id?: string;
  from_user_name?: string;
  is_read: boolean;
  created_at: string;
}
interface ForumNotificationsProps {
  userId: string;
  onNotificationClick?: (notification: ForumNotification) => void;
}
const ForumNotifications = ({
  userId,
  onNotificationClick,
}: ForumNotificationsProps) => {
  const [notifications, setNotifications] = useState<ForumNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    fetchNotifications();
  }, [userId]);
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `/api/forum/notifications?user_id=${userId}&limit=20`
      );
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(
          result.data.filter((n: ForumNotification) => !n.is_read).length
        );
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/forum/notifications/${notificationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_read: true }),
        }
      );
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {}
  };
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/forum/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {}
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'topic_reply':
        return 'ri-message-3-line text-blue-500';
      case 'topic_like':
      case 'reply_like':
        return 'ri-heart-line text-red-500';
      case 'topic_mention':
      case 'reply_mention':
        return 'ri-at-line text-purple-500';
      case 'topic_solved':
        return 'ri-check-line text-green-500';
      case 'topic_featured':
        return 'ri-star-line text-yellow-500';
      default:
        return 'ri-notification-line text-gray-500';
    }
  };
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'topic_reply':
        return 'bg-blue-50 border-blue-200';
      case 'topic_like':
      case 'reply_like':
        return 'bg-red-50 border-red-200';
      case 'topic_mention':
      case 'reply_mention':
        return 'bg-purple-50 border-purple-200';
      case 'topic_solved':
        return 'bg-green-50 border-green-200';
      case 'topic_featured':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };
  const handleNotificationClick = (notification: ForumNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setShowDropdown(false);
  };
  return (
    <div className='relative'>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
      >
        <i className='ri-notification-3-line text-gray-600 text-xl'></i>
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {/* Dropdown */}
      {showDropdown && (
        <div className='absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden'>
          {/* Header */}
          <div className='p-4 border-b border-gray-100 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-gray-900'>
                Forum Bildirimleri
              </h3>
              <div className='flex items-center gap-2'>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className='text-xs text-blue-600 hover:text-blue-800 font-medium'
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <i className='ri-close-line text-lg'></i>
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className='text-xs text-gray-600 mt-1'>
                {unreadCount} okunmamış bildirim
              </p>
            )}
          </div>
          {/* Notifications List */}
          <div className='max-h-80 overflow-y-auto'>
            {loading ? (
              <div className='p-8 text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
                <p className='text-sm text-gray-600'>
                  Bildirimler yükleniyor...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className='p-8 text-center'>
                <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <i className='ri-notification-off-line text-gray-400 text-xl'></i>
                </div>
                <p className='text-sm text-gray-600'>Henüz bildiriminiz yok</p>
                <p className='text-xs text-gray-500 mt-1'>
                  Forum aktiviteleriniz burada görünecek
                </p>
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                        }`}
                      >
                        <i
                          className={`${getNotificationIcon(notification.type)} text-sm`}
                        ></i>
                      </div>
                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1'>
                            <h4 className='text-sm font-medium text-gray-900 mb-1'>
                              {notification.title}
                            </h4>
                            <p className='text-sm text-gray-600 mb-2'>
                              {notification.message}
                            </p>
                            {notification.from_user_name && (
                              <p className='text-xs text-gray-500'>
                                <i className='ri-user-line mr-1'></i>
                                {notification.from_user_name}
                              </p>
                            )}
                          </div>
                          {!notification.is_read && (
                            <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1'></div>
                          )}
                        </div>
                        <p className='text-xs text-gray-500 mt-2'>
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Footer */}
          {notifications.length > 0 && (
            <div className='p-3 border-t border-gray-100 bg-gray-50'>
              <Link href='/firma/forum/bildirimler'>
                <button className='w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium'>
                  Tüm Bildirimleri Görüntüle
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
      {/* Backdrop */}
      {showDropdown && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};
export default ForumNotifications;
