'use client';
import React from 'react';
import { RiLoader4Line } from 'react-icons/ri';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Yükleniyor...',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  const content = (
    <div className='flex flex-col items-center justify-center space-y-3'>
      <RiLoader4Line
        className={`${sizeClasses[size]} text-blue-600 animate-spin`}
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
  if (fullScreen) {
    return (
      <div className='fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'>
        {content}
      </div>
    );
  }
  return <div className='flex items-center justify-center p-8'>{content}</div>;
};
export default LoadingSpinner;
