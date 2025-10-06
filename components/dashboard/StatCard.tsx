'use client';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
  onClick,
  loading = false,
}: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          trendColor: 'text-blue-600',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          trendColor: 'text-green-600',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          trendColor: 'text-purple-600',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          trendColor: 'text-orange-600',
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          trendColor: 'text-red-600',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          trendColor: 'text-yellow-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          trendColor: 'text-gray-600',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-gray-300' : ''
      } ${colors.bg}`}
      onClick={onClick}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600 mb-1'>{title}</p>
          {loading ? (
            <div className='h-8 bg-gray-200 rounded animate-pulse mb-2'></div>
          ) : (
            <p className='text-3xl font-bold text-gray-900 mb-1'>{value}</p>
          )}
          {subtitle && <p className='text-xs text-gray-500'>{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center text-xs ${colors.trendColor} mt-2`}
            >
              <i
                className={`ri-arrow-${trend.isPositive ? 'up' : 'down'}-line mr-1`}
              ></i>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}
        >
          <i className={`${icon} ${colors.iconColor} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}
