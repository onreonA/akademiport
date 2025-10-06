'use client';
import { DashboardStats } from '@/lib/analytics-service';
interface DashboardStatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}
export default function DashboardStatsCards({
  stats,
  isLoading = false,
}: DashboardStatsCardsProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse'
          >
            <div className='flex items-center justify-between'>
              <div className='w-16 h-16 bg-gray-200 rounded-lg'></div>
              <div className='text-right'>
                <div className='w-20 h-6 bg-gray-200 rounded mb-2'></div>
                <div className='w-16 h-4 bg-gray-200 rounded'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  const cards = [
    {
      title: 'Toplam Randevu',
      value: stats.totalAppointments,
      icon: 'ri-calendar-line',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Bekleyen Randevu',
      value: stats.pendingAppointments,
      icon: 'ri-time-line',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'Toplam Firma',
      value: stats.totalCompanies,
      icon: 'ri-building-line',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Toplam Danışman',
      value: stats.totalConsultants,
      icon: 'ri-user-star-line',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow-sm border ${card.borderColor} p-6 hover:shadow-md transition-shadow duration-200`}
        >
          <div className='flex items-center justify-between'>
            <div
              className={`w-16 h-16 ${card.bgColor} rounded-lg flex items-center justify-center`}
            >
              <i className={`${card.icon} text-2xl ${card.color}`}></i>
            </div>
            <div className='text-right'>
              <div className={`text-3xl font-bold ${card.color} mb-1`}>
                {card.value.toLocaleString('tr-TR')}
              </div>
              <div className='text-sm text-gray-600 font-medium'>
                {card.title}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
