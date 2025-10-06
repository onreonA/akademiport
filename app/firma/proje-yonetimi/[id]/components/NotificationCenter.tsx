'use client';
import { useState } from 'react';
import {
  RiAlertLine,
  RiBellLine,
  RiCalendarLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiFileLine,
  RiInformationLine,
  RiTaskLine,
  RiUserLine,
} from 'react-icons/ri';
interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'file' | 'project';
  isRead: boolean;
  createdAt: string;
  projectId?: string;
  taskId?: string;
  fileId?: string;
  userId?: string;
}
interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
  onClearAll: () => void;
}
export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'type'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <RiCheckLine className='h-5 w-5 text-green-500' />;
      case 'warning':
        return <RiAlertLine className='h-5 w-5 text-yellow-500' />;
      case 'error':
        return <RiAlertLine className='h-5 w-5 text-red-500' />;
      case 'task':
        return <RiTaskLine className='h-5 w-5 text-blue-500' />;
      case 'file':
        return <RiFileLine className='h-5 w-5 text-purple-500' />;
      case 'project':
        return <RiUserLine className='h-5 w-5 text-indigo-500' />;
      default:
        return <RiInformationLine className='h-5 w-5 text-gray-500' />;
    }
  };
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'task':
        return 'bg-blue-50 border-blue-200';
      case 'file':
        return 'bg-purple-50 border-purple-200';
      case 'project':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.isRead;
      if (filter === 'type' && typeFilter !== 'all')
        return notification.type === typeFilter;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });
  const unreadCount = notifications.filter(n => !n.isRead).length;
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <RiBellLine className='h-6 w-6 text-gray-600' />
          <h2 className='text-xl font-semibold text-gray-900'>Bildirimler</h2>
          {unreadCount > 0 && (
            <span className='px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'>
              {unreadCount} okunmamış
            </span>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className='px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors'
            >
              Tümünü Okundu İşaretle
            </button>
          )}
          <button
            onClick={onClearAll}
            className='px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
          >
            Tümünü Temizle
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <label className='text-sm font-medium text-gray-700'>Filtre:</label>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className='px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='all'>Tümü</option>
            <option value='unread'>Okunmamış</option>
            <option value='type'>Türe Göre</option>
          </select>
        </div>
        {filter === 'type' && (
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className='px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='all'>Tüm Türler</option>
            <option value='info'>Bilgi</option>
            <option value='success'>Başarı</option>
            <option value='warning'>Uyarı</option>
            <option value='error'>Hata</option>
            <option value='task'>Görev</option>
            <option value='file'>Dosya</option>
            <option value='project'>Proje</option>
          </select>
        )}
        <div className='flex items-center space-x-2'>
          <label className='text-sm font-medium text-gray-700'>Sırala:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className='px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='newest'>En Yeni</option>
            <option value='oldest'>En Eski</option>
          </select>
        </div>
      </div>
      {/* Notifications List */}
      <div className='space-y-3'>
        {filteredNotifications.length === 0 ? (
          <div className='text-center py-12'>
            <RiBellLine className='h-16 w-16 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Bildirim Bulunamadı
            </h3>
            <p className='text-gray-600'>
              {filter === 'unread'
                ? 'Tüm bildirimler okundu olarak işaretlenmiş.'
                : 'Henüz bildirim bulunmuyor.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                notification.isRead
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-200 shadow-sm'
              } ${getNotificationColor(notification.type)}`}
            >
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 mt-1'>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4
                        className={`text-sm font-medium ${
                          notification.isRead
                            ? 'text-gray-900'
                            : 'text-gray-900 font-semibold'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <p
                        className={`text-sm mt-1 ${
                          notification.isRead
                            ? 'text-gray-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {notification.content}
                      </p>
                      <div className='flex items-center space-x-2 mt-2 text-xs text-gray-500'>
                        <RiCalendarLine className='h-3 w-3' />
                        <span>{formatTimeAgo(notification.createdAt)}</span>
                        {!notification.isRead && (
                          <span className='px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full'>
                            Yeni
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center space-x-1 ml-2'>
                      {!notification.isRead && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className='p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors'
                          title='Okundu İşaretle'
                        >
                          <RiCheckLine className='h-4 w-4' />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(notification.id)}
                        className='p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
                        title='Sil'
                      >
                        <RiDeleteBinLine className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Stats */}
      <div className='bg-gray-50 rounded-lg p-4'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold text-gray-900'>
              {notifications.length}
            </div>
            <div className='text-sm text-gray-600'>Toplam</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-blue-600'>
              {unreadCount}
            </div>
            <div className='text-sm text-gray-600'>Okunmamış</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-green-600'>
              {notifications.filter(n => n.type === 'success').length}
            </div>
            <div className='text-sm text-gray-600'>Başarı</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-red-600'>
              {notifications.filter(n => n.type === 'error').length}
            </div>
            <div className='text-sm text-gray-600'>Hata</div>
          </div>
        </div>
      </div>
    </div>
  );
}
