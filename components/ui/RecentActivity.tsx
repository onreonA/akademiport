'use client';
import {
  RecentActivity as RecentActivityType,
  analyticsService,
} from '@/lib/analytics-service';
interface RecentActivityProps {
  activities: RecentActivityType[];
  isLoading?: boolean;
}
export default function RecentActivity({
  activities,
  isLoading = false,
}: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Son Aktiviteler
        </h3>
        <div className='space-y-4'>
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className='flex items-start space-x-3 animate-pulse'
            >
              <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
              <div className='flex-1'>
                <div className='w-32 h-4 bg-gray-200 rounded mb-2'></div>
                <div className='w-48 h-3 bg-gray-200 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - activityTime.getTime()) / (1000 * 60)
    );
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Son Aktiviteler</h3>
        <span className='text-sm text-gray-500'>
          {activities.length} aktivite
        </span>
      </div>
      <div className='space-y-4'>
        {activities.length === 0 ? (
          <div className='text-center py-8'>
            <i className='ri-inbox-line text-4xl text-gray-300 mb-2'></i>
            <p className='text-gray-500'>Henüz aktivite bulunmuyor</p>
          </div>
        ) : (
          activities.map(activity => (
            <div
              key={activity.id}
              className='flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200'
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${analyticsService.getActivityColor(activity.type).replace('text-', 'bg-').replace('-600', '-100')}`}
              >
                <i
                  className={`${analyticsService.getActivityIcon(activity.type)} ${analyticsService.getActivityColor(activity.type)} text-lg`}
                ></i>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm font-medium text-gray-900 truncate'>
                    {activity.title}
                  </h4>
                  <span className='text-xs text-gray-500 ml-2 flex-shrink-0'>
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                  {activity.description}
                </p>
                {(activity.companyName || activity.consultantName) && (
                  <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                    {activity.companyName && (
                      <span className='flex items-center'>
                        <i className='ri-building-line mr-1'></i>
                        {activity.companyName}
                      </span>
                    )}
                    {activity.consultantName && (
                      <span className='flex items-center'>
                        <i className='ri-user-star-line mr-1'></i>
                        {activity.consultantName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {activities.length > 0 && (
        <div className='mt-6 pt-4 border-t border-gray-200'>
          <button className='w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200'>
            Tüm Aktiviteleri Görüntüle
            <i className='ri-arrow-right-line ml-1'></i>
          </button>
        </div>
      )}
    </div>
  );
}
