'use client';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'white';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

/**
 * Loading Spinner Component
 *
 * @example
 * <LoadingSpinner size="md" text="Yükleniyor..." />
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  className = '',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    white: 'text-white',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-gray-200 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}
      ></div>
      {text && (
        <p className='mt-3 text-sm text-gray-600 animate-pulse font-medium'>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className='fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center'>
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Inline Loading Spinner (for buttons, small spaces)
 */
export function InlineSpinner({
  size = 'sm',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      ></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      ></path>
    </svg>
  );
}
/**
 * Skeleton Loader - Generic skeleton for text lines
 */
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
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 rounded animate-pulse`}
          style={{
            width: index === lines - 1 ? '80%' : '100%',
            animationDelay: `${index * 0.1}s`,
          }}
        ></div>
      ))}
    </div>
  );
}

/**
 * Card Skeleton - Skeleton for card components
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse'
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
            <div className='text-right space-y-2'>
              <div className='w-20 h-6 bg-gray-200 rounded ml-auto'></div>
              <div className='w-16 h-4 bg-gray-200 rounded ml-auto'></div>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='w-full h-4 bg-gray-200 rounded'></div>
            <div className='w-4/5 h-4 bg-gray-200 rounded'></div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table Skeleton - Skeleton for tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      <div className='p-4 border-b border-gray-200 animate-pulse'>
        <div className='grid grid-cols-4 gap-4'>
          <div className='h-4 bg-gray-200 rounded'></div>
          <div className='h-4 bg-gray-200 rounded'></div>
          <div className='h-4 bg-gray-200 rounded'></div>
          <div className='h-4 bg-gray-200 rounded'></div>
        </div>
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className='p-4 border-b border-gray-100 animate-pulse'>
          <div
            className='grid grid-cols-4 gap-4'
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Skeleton - Skeleton for charts
 */
export function ChartSkeleton() {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse'>
      <div className='w-32 h-6 bg-gray-200 rounded mb-6'></div>
      <div className='w-full h-64 bg-gray-200 rounded'></div>
    </div>
  );
}

/**
 * Page Loading - Full page loading overlay
 */
export function PageLoading({ text = 'Yükleniyor...' }: { text?: string }) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <LoadingSpinner size='lg' text={text} />
    </div>
  );
}

/**
 * Section Loading - Loading overlay for a section
 */
export function SectionLoading({
  text = 'Yükleniyor...',
  height = 'h-64',
}: {
  text?: string;
  height?: string;
}) {
  return (
    <div
      className={`${height} flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200`}
    >
      <LoadingSpinner size='md' text={text} />
    </div>
  );
}
