'use client';
import { Loader2, FileText, Users, BarChart3, Calendar } from 'lucide-react';
import React from 'react';
interface LoadingStateProps {
  type?: 'default' | 'skeleton' | 'spinner';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'default',
  message = 'Yükleniyor...',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  const messageSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  if (type === 'spinner') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 ${className}`}
      >
        <Loader2
          className={`${sizeClasses[size]} animate-spin text-blue-600`}
        />
        <p className={`mt-4 text-gray-600 ${messageSizes[size]}`}>{message}</p>
      </div>
    );
  }
  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header Skeleton */}
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gray-200 rounded-lg animate-pulse'></div>
          <div className='flex-1'>
            <div className='h-6 bg-gray-200 rounded animate-pulse mb-2'></div>
            <div className='h-4 bg-gray-200 rounded animate-pulse w-2/3'></div>
          </div>
        </div>
        {/* Cards Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className='bg-white rounded-lg p-6 shadow-sm border border-gray-100'
            >
              <div className='flex items-center justify-between mb-4'>
                <div className='h-4 bg-gray-200 rounded animate-pulse w-1/2'></div>
                <div className='w-8 h-8 bg-gray-200 rounded animate-pulse'></div>
              </div>
              <div className='h-8 bg-gray-200 rounded animate-pulse mb-2'></div>
              <div className='h-3 bg-gray-200 rounded animate-pulse w-1/3'></div>
            </div>
          ))}
        </div>
        {/* Content Skeleton */}
        <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-100'>
          <div className='h-6 bg-gray-200 rounded animate-pulse mb-4 w-1/3'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-4 bg-gray-200 rounded animate-pulse w-5/6'></div>
            <div className='h-4 bg-gray-200 rounded animate-pulse w-4/6'></div>
          </div>
        </div>
      </div>
    );
  }
  // Default loading state
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}
    >
      <div className='relative'>
        <Loader2
          className={`${sizeClasses[size]} animate-spin text-blue-600`}
        />
        <div className='absolute inset-0 rounded-full border-2 border-blue-200 animate-ping'></div>
      </div>
      <p className={`mt-4 text-gray-600 ${messageSizes[size]} text-center`}>
        {message}
      </p>
      <div className='mt-2 flex space-x-1'>
        <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'></div>
        <div
          className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  );
};
// Dashboard specific loading state
export const DashboardLoadingState: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards Loading */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[
          { icon: <FileText size={24} />, color: 'from-blue-500 to-blue-600' },
          { icon: <Users size={24} />, color: 'from-green-500 to-green-600' },
          {
            icon: <BarChart3 size={24} />,
            color: 'from-purple-500 to-purple-600',
          },
          {
            icon: <Calendar size={24} />,
            color: 'from-orange-500 to-orange-600',
          },
        ].map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.color} rounded-lg p-6 text-white animate-pulse`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <div className='h-4 bg-white/30 rounded mb-2 w-20'></div>
                <div className='h-8 bg-white/30 rounded w-12'></div>
              </div>
              <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Welcome Message Loading */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 animate-pulse'>
        <div className='h-6 bg-blue-200 rounded mb-3 w-1/3'></div>
        <div className='space-y-2'>
          <div className='h-4 bg-blue-200 rounded'></div>
          <div className='h-4 bg-blue-200 rounded w-5/6'></div>
        </div>
      </div>
    </div>
  );
};
export default LoadingState;
