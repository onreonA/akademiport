'use client';
import React from 'react';
import {
  RiAlertLine,
  RiBellLine,
  RiCheckLine,
  RiFileLine,
  RiFolderLine,
} from 'react-icons/ri';
interface NotificationsTabProps {
  notifications: any[];
}
const NotificationsTab: React.FC<NotificationsTabProps> = React.memo(
  ({ notifications }) => {
    const getNotificationIcon = (type: string) => {
      switch (type) {
        case 'task_completed':
          return <RiCheckLine className='h-5 w-5 text-green-500' />;
        case 'task_assigned':
          return <RiFolderLine className='h-5 w-5 text-blue-500' />;
        case 'file_uploaded':
          return <RiFileLine className='h-5 w-5 text-purple-500' />;
        case 'comment_added':
          return <RiBellLine className='h-5 w-5 text-yellow-500' />;
        default:
          return <RiAlertLine className='h-5 w-5 text-gray-500' />;
      }
    };
    const getNotificationColor = (type: string) => {
      switch (type) {
        case 'task_completed':
          return 'border-l-green-500 bg-green-50';
        case 'task_assigned':
          return 'border-l-blue-500 bg-blue-50';
        case 'file_uploaded':
          return 'border-l-purple-500 bg-purple-50';
        case 'comment_added':
          return 'border-l-yellow-500 bg-yellow-50';
        default:
          return 'border-l-gray-500 bg-gray-50';
      }
    };
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>Bildirimler</h3>
          <span className='text-sm text-gray-500'>
            {notifications.length} bildirim
          </span>
        </div>
        {notifications.length === 0 ? (
          <div className='text-center py-12'>
            <RiBellLine className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Henüz bildirim yok
            </h3>
            <p className='text-gray-500'>Yeni bildirimler burada görünecek.</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.is_read ? 'bg-opacity-100' : 'bg-opacity-50'
                }`}
              >
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0 mt-0.5'>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        {notification.title}
                      </h4>
                      <span className='text-xs text-gray-500'>
                        {notification.created_at}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mt-1'>
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <div className='mt-2'>
                        <span className='inline-block w-2 h-2 bg-blue-500 rounded-full'></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
NotificationsTab.displayName = 'NotificationsTab';
export default NotificationsTab;
