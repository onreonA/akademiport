'use client';
import Link from 'next/link';
import { useState } from 'react';

interface ActivityItem {
  id: string;
  type:
    | 'project_created'
    | 'task_completed'
    | 'assignment'
    | 'report'
    | 'update';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  projectId?: string;
  projectName?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
  maxItems?: number;
}

export default function RecentActivity({
  activities,
  title = 'Son Aktiviteler',
  className = '',
  maxItems = 5,
}: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedActivities = showAll
    ? activities
    : activities.slice(0, maxItems);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'project_created':
        return 'ri-folder-add-line text-blue-600';
      case 'task_completed':
        return 'ri-checkbox-circle-line text-green-600';
      case 'assignment':
        return 'ri-user-add-line text-purple-600';
      case 'report':
        return 'ri-file-chart-line text-orange-600';
      case 'update':
        return 'ri-edit-line text-gray-600';
      default:
        return 'ri-notification-line text-gray-600';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'project_created':
        return 'border-l-blue-500 bg-blue-50';
      case 'task_completed':
        return 'border-l-green-500 bg-green-50';
      case 'assignment':
        return 'border-l-purple-500 bg-purple-50';
      case 'report':
        return 'border-l-orange-500 bg-orange-50';
      case 'update':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
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
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
        {activities.length > maxItems && (
          <button
            onClick={() => setShowAll(!showAll)}
            className='text-sm text-blue-600 hover:text-blue-700 transition-colors'
          >
            {showAll ? 'Daha Az Göster' : 'Tümünü Göster'}
          </button>
        )}
      </div>

      {displayedActivities.length === 0 ? (
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-notification-line text-gray-400 text-2xl'></i>
          </div>
          <p className='text-gray-500'>Henüz aktivite bulunmuyor</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {displayedActivities.map(activity => (
            <div
              key={activity.id}
              className={`p-4 rounded-lg border-l-4 ${getActivityColor(activity.type)} hover:bg-gray-50 transition-colors ${
                activity.projectId ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (activity.projectId) {
                  window.location.href = `/admin/proje-yonetimi/${activity.projectId}`;
                }
              }}
            >
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 mt-1'>
                  <i
                    className={`${getActivityIcon(activity.type)} text-lg`}
                  ></i>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {activity.title}
                    </p>
                    <span className='text-xs text-gray-500 ml-2 flex-shrink-0'>
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                    {activity.description}
                  </p>
                  {activity.user && (
                    <p className='text-xs text-gray-500 mt-1'>
                      {activity.user}
                    </p>
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
