'use client';
import React, { useEffect, useState } from 'react';

import { useSocket } from '@/hooks/useSocket';
import { notificationService } from '@/lib/notification-service';
interface RealTimeNotificationsProps {
  companyId?: string;
  isAdmin?: boolean;
  onAppointmentUpdate?: (appointmentId: string, updates: any) => void;
}
export default function RealTimeNotifications({
  companyId,
  isAdmin = false,
  onAppointmentUpdate,
}: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationPermission, setShowNotificationPermission] =
    useState(false);
  const {
    isConnected,
    lastMessage,
    emitAppointmentUpdated,
    emitAppointmentCreated,
    emitConsultantAssigned,
  } = useSocket({
    companyId,
    isAdmin,
    onAppointmentStatusChanged: data => {
      addNotification({
        type: 'status-change',
        title: 'Randevu Durumu Değişti',
        message: `Randevu durumu güncellendi: ${data.status}`,
        timestamp: data.timestamp,
        data,
      });
      // Show browser notification
      notificationService.showAppointmentStatusNotification(
        data.status,
        data.appointmentTitle || 'Randevu'
      );
    },
    onConsultantAssigned: data => {
      addNotification({
        type: 'consultant-assigned',
        title: 'Danışman Atandı',
        message: `${data.consultantName} danışmanı atandı`,
        timestamp: data.timestamp,
        data,
      });
      // Show browser notification
      notificationService.showConsultantAssignedNotification(
        data.consultantName,
        data.appointmentTitle || 'Randevu'
      );
    },
    onNewAppointment: data => {
      addNotification({
        type: 'new-appointment',
        title: 'Yeni Randevu Talebi',
        message: `Yeni randevu talebi alındı`,
        timestamp: data.timestamp,
        data,
      });
      // Show browser notification
      notificationService.showNewAppointmentNotification(
        data.companyName || 'Firma',
        data.title || 'Randevu'
      );
    },
    onAppointmentUpdated: data => {
      addNotification({
        type: 'appointment-updated',
        title: 'Randevu Güncellendi',
        message: `Randevu güncellendi`,
        timestamp: data.timestamp,
        data,
      });
    },
  });
  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
  };
  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };
  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setShowNotificationPermission(false);
    }
  };
  useEffect(() => {
    // Check notification permission on mount
    if (!notificationService.isSupported()) {
      return;
    }
    if (notificationService.getPermission() === 'default') {
      setShowNotificationPermission(true);
    }
  }, []);
  // Auto-remove notifications after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev =>
        prev.filter(notification => {
          const notificationTime = new Date(notification.timestamp).getTime();
          const currentTime = new Date().getTime();
          return currentTime - notificationTime < 10000; // 10 seconds
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      {/* Notification Permission Request */}
      {showNotificationPermission && (
        <div className='fixed top-4 right-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <i className='ri-notification-3-line text-blue-600 text-xl'></i>
            </div>
            <div className='ml-3 flex-1'>
              <h3 className='text-sm font-medium text-blue-800'>
                Bildirim İzni
              </h3>
              <p className='mt-1 text-sm text-blue-700'>
                Gerçek zamanlı bildirimler almak için izin verin.
              </p>
              <div className='mt-3 flex space-x-2'>
                <button
                  onClick={requestNotificationPermission}
                  className='bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors'
                >
                  İzin Ver
                </button>
                <button
                  onClick={() => setShowNotificationPermission(false)}
                  className='bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors'
                >
                  Daha Sonra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Connection Status */}
      <div className='fixed bottom-4 right-4 z-40'>
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm ${
            isConnected
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></div>
          <span>{isConnected ? 'Bağlı' : 'Bağlantı Yok'}</span>
        </div>
      </div>
      {/* Real-time Notifications */}
      <div className='fixed top-4 right-4 z-30 space-y-2'>
        {notifications.map((notification, index) => (
          <div
            key={index}
            className={`bg-white border rounded-lg p-4 shadow-lg max-w-sm transform transition-all duration-300 ${
              notification.type === 'status-change'
                ? 'border-green-200 bg-green-50'
                : notification.type === 'consultant-assigned'
                  ? 'border-blue-200 bg-blue-50'
                  : notification.type === 'new-appointment'
                    ? 'border-purple-200 bg-purple-50'
                    : 'border-gray-200'
            }`}
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h4 className='text-sm font-medium text-gray-900'>
                  {notification.title}
                </h4>
                <p className='text-sm text-gray-600 mt-1'>
                  {notification.message}
                </p>
                <p className='text-xs text-gray-500 mt-2'>
                  {new Date(notification.timestamp).toLocaleTimeString('tr-TR')}
                </p>
              </div>
              <button
                onClick={() => removeNotification(index)}
                className='ml-2 text-gray-400 hover:text-gray-600 transition-colors'
              >
                <i className='ri-close-line'></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
