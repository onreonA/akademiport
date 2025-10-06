'use client';
import {
  LockClosedIcon,
  EyeIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface LockedStateCardProps {
  title: string;
  description?: string;
  status: 'locked' | 'revoked';
  type: 'project' | 'sub-project' | 'task';
  onViewHistory?: () => void;
  className?: string;
}

export default function LockedStateCard({
  title,
  description,
  status,
  type,
  onViewHistory,
  className = '',
}: LockedStateCardProps) {
  const getStatusConfig = () => {
    if (status === 'locked') {
      return {
        icon: LockClosedIcon,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        statusText: 'KİLİTLİ',
        statusColor: 'bg-yellow-100 text-yellow-800',
        message: getLockedMessage(),
        actionText: 'Geçmiş İşlemler',
      };
    } else {
      return {
        icon: InformationCircleIcon,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        statusText: 'KALDIRILMIŞ',
        statusColor: 'bg-red-100 text-red-800',
        message: getRevokedMessage(),
        actionText: 'Geçmiş Görüntüle',
      };
    }
  };

  const getLockedMessage = () => {
    switch (type) {
      case 'project':
        return 'Bu proje artık size atanmamıştır. Geçmiş işlemlerinizi görüntüleyebilirsiniz.';
      case 'sub-project':
        return 'Bu alt proje artık size atanmamıştır. Geçmiş işlemlerinizi görüntüleyebilirsiniz.';
      case 'task':
        return 'Bu görev artık size atanmamıştır. Geçmiş işlemlerinizi görüntüleyebilirsiniz.';
      default:
        return 'Bu öğe artık size atanmamıştır.';
    }
  };

  const getRevokedMessage = () => {
    switch (type) {
      case 'project':
        return 'Bu projeye erişim yetkiniz kaldırılmıştır.';
      case 'sub-project':
        return 'Bu alt projeye erişim yetkiniz kaldırılmıştır.';
      case 'task':
        return 'Bu göreve erişim yetkiniz kaldırılmıştır.';
      default:
        return 'Bu öğeye erişim yetkiniz kaldırılmıştır.';
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`relative ${config.bgColor} border-2 ${config.borderColor} rounded-lg p-6 opacity-75 ${className}`}
    >
      {/* Status Badge */}
      <div className='absolute top-3 right-3'>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.statusColor}`}
        >
          <Icon className='w-4 h-4' />
          <span>{config.statusText}</span>
        </div>
      </div>

      {/* Lock Icon */}
      <div className='flex items-center gap-3 mb-4'>
        <div
          className={`w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center ${config.iconColor}`}
        >
          <Icon className='w-6 h-6' />
        </div>
        <div>
          <h3 className='font-bold text-gray-700 text-lg'>{title}</h3>
          {description && (
            <p className='text-sm text-gray-600 mt-1'>{description}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div className='mb-4'>
        <p className='text-sm text-gray-600 leading-relaxed'>
          {config.message}
        </p>
      </div>

      {/* Actions */}
      {onViewHistory && (
        <div className='flex items-center gap-3'>
          <button
            onClick={onViewHistory}
            className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm'
          >
            <EyeIcon className='w-4 h-4' />
            <span>{config.actionText}</span>
          </button>
        </div>
      )}

      {/* Additional Info */}
      <div className='mt-4 pt-4 border-t border-gray-200'>
        <div className='flex items-center gap-2 text-xs text-gray-500'>
          <InformationCircleIcon className='w-4 h-4' />
          <span>
            {status === 'locked'
              ? 'Bu öğe sadece görüntüleme modunda erişilebilir'
              : 'Bu öğeye erişim tamamen kaldırılmıştır'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Locked State Badge Component
interface LockedStateBadgeProps {
  status: 'locked' | 'revoked';
  className?: string;
}

export function LockedStateBadge({
  status,
  className = '',
}: LockedStateBadgeProps) {
  const config =
    status === 'locked'
      ? {
          text: 'KİLİTLİ',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        }
      : {
          text: 'KALDIRILMIŞ',
          className: 'bg-red-100 text-red-800 border-red-200',
        };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {status === 'locked' ? (
        <LockClosedIcon className='w-3 h-3 mr-1' />
      ) : (
        <InformationCircleIcon className='w-3 h-3 mr-1' />
      )}
      {config.text}
    </span>
  );
}

// Locked State Overlay Component
interface LockedStateOverlayProps {
  children: React.ReactNode;
  isLocked: boolean;
  status: 'locked' | 'revoked';
  message?: string;
}

export function LockedStateOverlay({
  children,
  isLocked,
  status,
  message,
}: LockedStateOverlayProps) {
  if (!isLocked) return <>{children}</>;

  const overlayColor = status === 'locked' ? 'bg-yellow-500' : 'bg-red-500';
  const iconColor = status === 'locked' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className='relative'>
      {children}
      <div
        className={`absolute inset-0 ${overlayColor} bg-opacity-10 flex items-center justify-center rounded-lg`}
      >
        <div className='bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200 max-w-sm text-center'>
          <LockClosedIcon className={`w-8 h-8 mx-auto mb-2 ${iconColor}`} />
          <p className='text-sm font-medium text-gray-700 mb-1'>
            {status === 'locked' ? 'Kilitli' : 'Erişim Kaldırılmış'}
          </p>
          <p className='text-xs text-gray-500'>
            {message || 'Bu öğeye erişim yetkiniz yok'}
          </p>
        </div>
      </div>
    </div>
  );
}
