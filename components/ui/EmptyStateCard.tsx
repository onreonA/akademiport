/**
 * @deprecated This component is deprecated. Use EmptyState from '@/components/ui/EmptyState' instead.
 *
 * Migration:
 * ```tsx
 * // OLD
 * import EmptyStateCard from '@/components/ui/EmptyStateCard';
 * <EmptyStateCard type="no-projects" />
 *
 * // NEW
 * import EmptyState from '@/components/ui/EmptyState';
 * <EmptyState type="no-projects" />
 * ```
 *
 * This file will be removed in a future version.
 */

'use client';
import {
  FolderOpenIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// Re-export new EmptyState for backward compatibility
export { default } from '@/components/ui/EmptyState';
export {
  CompactEmptyState,
  LoadingEmptyState,
} from '@/components/ui/EmptyState';

/**
 * @deprecated Use EmptyState instead
 */
interface EmptyStateCardProps {
  type:
    | 'no-projects'
    | 'no-sub-projects'
    | 'no-tasks'
    | 'no-assignments'
    | 'locked-projects';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * @deprecated This component is deprecated. Use EmptyState from '@/components/ui/EmptyState' instead.
 */
export function OldEmptyStateCard({
  type,
  title,
  description,
  actionText,
  onAction,
  className = '',
}: EmptyStateCardProps) {
  const getConfig = () => {
    switch (type) {
      case 'no-projects':
        return {
          icon: FolderOpenIcon,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          defaultTitle: 'Proje Atanmamış',
          defaultDescription:
            'Tarafınıza hiç proje atanmamıştır. Danışmanınızla iletişime geçiniz.',
          defaultActionText: 'Danışmanla İletişim',
          showAction: true,
        };

      case 'no-sub-projects':
        return {
          icon: DocumentTextIcon,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          defaultTitle: 'Alt Proje Bulunamadı',
          defaultDescription:
            'Bu projede size atanmış alt proje bulunmamaktadır.',
          defaultActionText: 'Yenile',
          showAction: true,
        };

      case 'no-tasks':
        return {
          icon: CheckCircleIcon,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          defaultTitle: 'Görev Bulunamadı',
          defaultDescription: 'Bu alt projede görev bulunmamaktadır.',
          defaultActionText: 'Yenile',
          showAction: true,
        };

      case 'no-assignments':
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          defaultTitle: 'Atama Bulunamadı',
          defaultDescription: 'Bu projeye henüz firma atanmamıştır.',
          defaultActionText: 'Firma Ata',
          showAction: true,
        };

      case 'locked-projects':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          defaultTitle: 'Kilitli Projeler',
          defaultDescription:
            'Size atanmış projeler kilitli durumda. Geçmiş işlemlerinizi görüntüleyebilirsiniz.',
          defaultActionText: 'Geçmiş Görüntüle',
          showAction: true,
        };

      default:
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          defaultTitle: 'Veri Bulunamadı',
          defaultDescription: 'Gösterilecek veri bulunmamaktadır.',
          defaultActionText: 'Yenile',
          showAction: false,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-8 text-center ${className}`}
    >
      {/* Icon */}
      <div className='flex justify-center mb-4'>
        <div
          className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center ${config.iconColor}`}
        >
          <Icon className='w-8 h-8' />
        </div>
      </div>

      {/* Title */}
      <h3 className='text-lg font-semibold text-gray-800 mb-2'>
        {title || config.defaultTitle}
      </h3>

      {/* Description */}
      <p className='text-gray-600 mb-6 max-w-md mx-auto'>
        {description || config.defaultDescription}
      </p>

      {/* Action Button */}
      {config.showAction && onAction && (
        <button
          onClick={onAction}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${config.iconColor.replace('text-', 'bg-')} hover:opacity-90 transition-opacity`}
        >
          {actionText || config.defaultActionText}
        </button>
      )}

      {/* Additional Help Text */}
      {type === 'no-projects' && (
        <div className='mt-6 p-4 bg-white bg-opacity-50 rounded-lg'>
          <h4 className='text-sm font-medium text-gray-700 mb-2'>
            Ne yapabilirsiniz?
          </h4>
          <ul className='text-xs text-gray-600 space-y-1 text-left max-w-sm mx-auto'>
            <li>• Danışmanınızla iletişime geçin</li>
            <li>• Proje atama talebinde bulunun</li>
            <li>• Sistem yöneticisine başvurun</li>
          </ul>
        </div>
      )}

      {type === 'locked-projects' && (
        <div className='mt-6 p-4 bg-white bg-opacity-50 rounded-lg'>
          <h4 className='text-sm font-medium text-gray-700 mb-2'>
            Kilitli Projeler
          </h4>
          <ul className='text-xs text-gray-600 space-y-1 text-left max-w-sm mx-auto'>
            <li>• Proje yetkileriniz kaldırılmış</li>
            <li>• Geçmiş işlemlerinizi görüntüleyebilirsiniz</li>
            <li>• Yeni işlem yapamazsınız</li>
          </ul>
        </div>
      )}
    </div>
  );
}
