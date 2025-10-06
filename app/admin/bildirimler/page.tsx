'use client';
import { useCallback, useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
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
    project: boolean;
    appointment: boolean;
    document: boolean;
  };
  quiet_hours_start: string;
  quiet_hours_end: string;
}
export default function AdminNotificationsPage() {
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
  }, [showUnreadOnly, selectedCategory]);
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
      general: 'ri-notification-line',
      education: 'ri-book-line',
      gamification: 'ri-trophy-line',
      system: 'ri-settings-line',
      assignment: 'ri-task-line',
      project: 'ri-project-line',
      appointment: 'ri-calendar-line',
      document: 'ri-file-line',
    };
    return iconMap[notification.category] || 'ri-notification-line';
  };
  const getNotificationColor = (notification: Notification) => {
    const colorMap: { [key: string]: string } = {
      info: 'text-blue-600 bg-blue-100',
      success: 'text-green-600 bg-green-100',
      warning: 'text-orange-600 bg-orange-100',
      error: 'text-red-600 bg-red-100',
    };
    return colorMap[notification.type] || 'text-gray-600 bg-gray-100';
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const categories = [
    { value: 'all', label: 'Tümü' },
    { value: 'general', label: 'Genel' },
    { value: 'education', label: 'Eğitim' },
    { value: 'project', label: 'Proje' },
    { value: 'appointment', label: 'Randevu' },
    { value: 'document', label: 'Belge' },
    { value: 'system', label: 'Sistem' },
  ];
  if (loading) {
    return (
      <AdminLayout
        title='Bildirimler'
        description='Sistem bildirimleri ve ayarları'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Bildirimler yükleniyor...</span>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout
      title='Bildirimler'
      description='Sistem bildirimleri ve ayarları'
    >
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Bildirimler</h1>
            <p className='text-gray-600'>Sistem bildirimleri ve ayarları</p>
          </div>
          <div className='flex space-x-3'>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
            >
              <i className='ri-settings-line mr-2'></i>
              Ayarlar
            </button>
            <button
              onClick={markAllAsRead}
              disabled={notifications.filter(n => !n.read_at).length === 0}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              <i className='ri-check-line mr-2'></i>
              Tümünü Okundu İşaretle
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
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
                  Sadece okunmamışlar
                </span>
              </label>
            </div>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <i className='ri-error-warning-line text-red-400'></i>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Notifications List */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          {notifications.length === 0 ? (
            <div className='text-center py-12'>
              <div className='w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <i className='ri-notification-off-line text-2xl text-gray-400'></i>
              </div>
              <p className='text-gray-500'>Henüz bildirim bulunmuyor</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-200'>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read_at ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className='flex items-start space-x-4'>
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification)}`}
                    >
                      <i
                        className={`${getNotificationIcon(notification)} text-lg`}
                      ></i>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-sm font-medium text-gray-900'>
                          {notification.title}
                        </h3>
                        <div className='flex items-center space-x-2'>
                          <span className='text-xs text-gray-500'>
                            {formatDate(notification.created_at)}
                          </span>
                          {!notification.read_at && (
                            <button
                              onClick={() => markAsRead([notification.id])}
                              className='text-xs text-blue-600 hover:text-blue-800'
                            >
                              Okundu işaretle
                            </button>
                          )}
                        </div>
                      </div>
                      <p className='mt-1 text-sm text-gray-600'>
                        {notification.message}
                      </p>
                      {notification.action_url && (
                        <div className='mt-2'>
                          <a
                            href={notification.action_url}
                            className='text-sm text-blue-600 hover:text-blue-800'
                          >
                            Detayları Görüntüle →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
