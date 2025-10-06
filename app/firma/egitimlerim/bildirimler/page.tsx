'use client';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  icon: string;
  color: string;
  data: any;
  read_at: string | null;
  action_url: string | null;
  priority: number;
  created_at: string;
}
interface NotificationSettings {
  id: string;
  user_id: string;
  company_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  notification_types: {
    general: boolean;
    education: boolean;
    gamification: boolean;
    system: boolean;
    assignment: boolean;
  };
  quiet_hours_start: string;
  quiet_hours_end: string;
}
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, [selectedCategory, showUnreadOnly, fetchNotifications, fetchSettings]);
  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
      });
      if (showUnreadOnly) {
        params.append('unread_only', 'true');
      }
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      const response = await fetch(`/api/notifications?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data.notifications);
        } else {
          setError(result.error || 'Bildirimler yüklenirken hata oluştu');
        }
      } else {
        setError('Bildirimler yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Bildirimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showUnreadOnly]);
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/notification-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      }
    } catch (err) {}
  }, []);
  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          notification_ids: notificationIds,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          setNotifications(prev =>
            prev.map(notification =>
              notificationIds.includes(notification.id)
                ? { ...notification, read_at: new Date().toISOString() }
                : notification
            )
          );
        }
      }
    } catch (err) {}
  };
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read_at);
    if (unreadNotifications.length > 0) {
      await markAsRead(unreadNotifications.map(n => n.id));
    }
  };
  const getNotificationIcon = (notification: Notification) => {
    const iconMap: { [key: string]: string } = {
      success: 'ri-check-line',
      warning: 'ri-error-warning-line',
      error: 'ri-close-line',
      info: 'ri-information-line',
      achievement: 'ri-trophy-line',
      badge: 'ri-medal-line',
      level_up: 'ri-star-line',
    };
    return (
      iconMap[notification.type] || notification.icon || 'ri-notification-line'
    );
  };
  const getNotificationColor = (notification: Notification) => {
    const colorMap: { [key: string]: string } = {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      achievement: '#FF6B35',
      badge: '#FFD700',
      level_up: '#8B5CF6',
    };
    return colorMap[notification.type] || notification.color || '#3B82F6';
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) {
      return 'Az önce';
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün önce`;
    }
  };
  const unreadCount = notifications.filter(n => !n.read_at).length;
  if (loading) {
    return (
      <FirmaLayout
        title='Bildirimler'
        description='Eğitim bildirimlerinizi görüntüleyin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-gray-600'>Bildirimler yükleniyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (error) {
    return (
      <FirmaLayout
        title='Bildirimler'
        description='Eğitim bildirimlerinizi görüntüleyin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-error-warning-line text-red-600 text-2xl'></i>
            </div>
            <h3 className='text-lg font-medium text-red-900 mb-2'>
              Hata Oluştu
            </h3>
            <p className='text-red-700 mb-6'>{error}</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Bildirimler'
      description={
        unreadCount > 0
          ? `${unreadCount} okunmamış bildirim`
          : 'Tüm bildirimler okundu'
      }
    >
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Action Buttons */}
          <div className='flex justify-end items-center gap-3 mb-8'>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
              >
                Tümünü Okundu İşaretle
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors'
            >
              <i className='ri-settings-3-line mr-2'></i>
              Ayarlar
            </button>
          </div>
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <div className='flex flex-wrap items-center gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='all'>Tüm Kategoriler</option>
                  <option value='general'>Genel</option>
                  <option value='education'>Eğitim</option>
                  <option value='gamification'>Gamification</option>
                  <option value='system'>Sistem</option>
                  <option value='assignment'>Atama</option>
                </select>
              </div>
              <div className='flex items-center'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={showUnreadOnly}
                    onChange={e => setShowUnreadOnly(e.target.checked)}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='ml-2 text-sm text-gray-700'>
                    Sadece okunmamış
                  </span>
                </label>
              </div>
              <button
                onClick={fetchNotifications}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors'
              >
                <i className='ri-refresh-line mr-2'></i>
                Yenile
              </button>
            </div>
          </div>
          {/* Notifications List */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
            {notifications.length === 0 ? (
              <div className='text-center py-12'>
                <i className='ri-notification-off-line text-gray-400 text-4xl mb-4'></i>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Bildirim bulunamadı
                </h3>
                <p className='text-gray-500'>
                  Filtrelerinizi değiştirin veya daha sonra tekrar kontrol edin.
                </p>
              </div>
            ) : (
              <div className='divide-y divide-gray-200'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read_at
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    }`}
                    onClick={() => {
                      if (!notification.read_at) {
                        markAsRead([notification.id]);
                      }
                      if (notification.action_url) {
                        window.location.href = notification.action_url;
                      }
                    }}
                  >
                    <div className='flex items-start gap-4'>
                      <div
                        className='w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0'
                        style={{
                          backgroundColor:
                            getNotificationColor(notification) + '20',
                          color: getNotificationColor(notification),
                        }}
                      >
                        <i
                          className={`${getNotificationIcon(notification)} text-lg`}
                        ></i>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3
                            className={`font-medium ${!notification.read_at ? 'text-gray-900' : 'text-gray-700'}`}
                          >
                            {notification.title}
                          </h3>
                          <div className='flex items-center gap-2'>
                            {!notification.read_at && (
                              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                            )}
                            <span className='text-sm text-gray-500'>
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                        </div>
                        <p
                          className={`text-sm ${!notification.read_at ? 'text-gray-800' : 'text-gray-600'}`}
                        >
                          {notification.message}
                        </p>
                        {notification.category && (
                          <div className='mt-2'>
                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                              {notification.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Settings Modal */}
          {showSettings && (
            <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
              <div className='bg-white rounded-xl shadow-2xl w-full max-w-md'>
                <div className='p-6 border-b border-gray-200'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Bildirim Ayarları
                  </h3>
                </div>
                <div className='p-6 space-y-6'>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-4'>
                      Bildirim Türleri
                    </h4>
                    <div className='space-y-3'>
                      {settings &&
                        Object.entries(settings.notification_types).map(
                          ([type, enabled]) => (
                            <label key={type} className='flex items-center'>
                              <input
                                type='checkbox'
                                checked={enabled}
                                onChange={e => {
                                  // TODO: Update settings
                                }}
                                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                              />
                              <span className='ml-2 text-sm text-gray-700 capitalize'>
                                {type === 'general'
                                  ? 'Genel'
                                  : type === 'education'
                                    ? 'Eğitim'
                                    : type === 'gamification'
                                      ? 'Gamification'
                                      : type === 'system'
                                        ? 'Sistem'
                                        : type === 'assignment'
                                          ? 'Atama'
                                          : type}
                              </span>
                            </label>
                          )
                        )}
                    </div>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-4'>
                      Bildirim Kanalları
                    </h4>
                    <div className='space-y-3'>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={settings?.in_app_notifications ?? true}
                          onChange={e => {
                            // TODO: Update settings
                          }}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='ml-2 text-sm text-gray-700'>
                          Uygulama içi bildirimler
                        </span>
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={settings?.email_notifications ?? true}
                          onChange={e => {
                            // TODO: Update settings
                          }}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='ml-2 text-sm text-gray-700'>
                          E-posta bildirimleri
                        </span>
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={settings?.push_notifications ?? true}
                          onChange={e => {
                            // TODO: Update settings
                          }}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='ml-2 text-sm text-gray-700'>
                          Push bildirimleri
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className='p-6 border-t border-gray-200 flex justify-end gap-3'>
                  <button
                    onClick={() => setShowSettings(false)}
                    className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors'
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Save settings
                      setShowSettings(false);
                    }}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </FirmaLayout>
  );
}
