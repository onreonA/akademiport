'use client';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}
export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}
      ></div>
      {text && (
        <p className='mt-2 text-sm text-gray-600 animate-pulse'>{text}</p>
      )}
    </div>
  );
}
// Skeleton loading component
export function SkeletonLoader({
  className = '',
  lines = 3,
  height = 'h-4',
}: {
  className?: string;
  lines?: number;
  height?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 rounded animate-pulse`}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        ></div>
      ))}
    </div>
  );
}
// Card skeleton
export function CardSkeleton() {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse'>
      <div className='flex items-center justify-between mb-4'>
        <div className='w-16 h-16 bg-gray-200 rounded-lg'></div>
        <div className='text-right'>
          <div className='w-20 h-6 bg-gray-200 rounded mb-2'></div>
          <div className='w-16 h-4 bg-gray-200 rounded'></div>
        </div>
      </div>
    </div>
  );
}
// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse'>
      <div className='w-32 h-6 bg-gray-200 rounded mb-4'></div>
      <div className='w-full h-64 bg-gray-200 rounded'></div>
    </div>
  );
}
