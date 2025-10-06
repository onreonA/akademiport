'use client';
import React from 'react';
import {
  RiErrorWarningLine,
  RiRefreshLine,
  RiShieldLine,
  RiWifiOffLine,
} from 'react-icons/ri';

import {
  ApiError,
  getRecoveryAction,
  getRecoveryStrategy,
} from '../utils/errorHandling';
interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
  context?: string;
}
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  context,
}) => {
  const strategy = getRecoveryStrategy(error);
  const recoveryAction = getRecoveryAction(strategy);
  const getErrorIcon = () => {
    switch (strategy) {
      case 'network':
        return <RiWifiOffLine className='w-6 h-6 text-orange-600' />;
      case 'auth':
        return <RiShieldLine className='w-6 h-6 text-red-600' />;
      case 'permission':
        return <RiShieldLine className='w-6 h-6 text-red-600' />;
      case 'server':
        return <RiErrorWarningLine className='w-6 h-6 text-red-600' />;
      default:
        return <RiErrorWarningLine className='w-6 h-6 text-red-600' />;
    }
  };
  const getErrorColor = () => {
    switch (strategy) {
      case 'network':
        return 'border-orange-200 bg-orange-50';
      case 'auth':
        return 'border-red-200 bg-red-50';
      case 'permission':
        return 'border-red-200 bg-red-50';
      case 'server':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };
  const getErrorTitle = () => {
    switch (strategy) {
      case 'network':
        return 'Bağlantı Hatası';
      case 'auth':
        return 'Yetki Hatası';
      case 'permission':
        return 'İzin Hatası';
      case 'server':
        return 'Sunucu Hatası';
      default:
        return 'Hata Oluştu';
    }
  };
  return (
    <div className={`border-l-4 ${getErrorColor()} p-4 mb-4`}>
      <div className='flex items-start'>
        <div className='flex-shrink-0'>{getErrorIcon()}</div>
        <div className='ml-3 flex-1'>
          <h3 className='text-sm font-medium text-gray-900'>
            {getErrorTitle()}
          </h3>
          <div className='mt-1 text-sm text-gray-700'>
            <p>{error.message}</p>
            {recoveryAction && (
              <p className='mt-1 text-gray-600'>{recoveryAction}</p>
            )}
          </div>
          {context && (
            <p className='mt-1 text-xs text-gray-500'>Konum: {context}</p>
          )}
          <div className='mt-3 flex space-x-2'>
            {onRetry && (
              <button
                onClick={onRetry}
                className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1'
              >
                <RiRefreshLine className='w-4 h-4' />
                <span>Tekrar Dene</span>
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm transition-colors'
              >
                Kapat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ErrorDisplay;
