'use client';
import { useEffect, useState } from 'react';
import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from 'react-icons/ri';

import { Toast as ToastType } from '../hooks/useToast';
interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}
const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <RiCheckLine className='w-5 h-5 text-green-600' />;
      case 'error':
        return <RiErrorWarningLine className='w-5 h-5 text-red-600' />;
      case 'warning':
        return <RiErrorWarningLine className='w-5 h-5 text-yellow-600' />;
      case 'info':
        return <RiInformationLine className='w-5 h-5 text-blue-600' />;
      default:
        return <RiInformationLine className='w-5 h-5 text-gray-600' />;
    }
  };
  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  return (
    <div
      className={`
        ${getBackgroundColor()}
        border rounded-lg shadow-lg p-4 mb-3 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0'>{getIcon()}</div>
        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-medium text-gray-900'>{toast.title}</h4>
          {toast.message && (
            <p className='mt-1 text-sm text-gray-600'>{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className='mt-2 text-sm font-medium text-blue-600 hover:text-blue-500'
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className='flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors'
        >
          <RiCloseLine className='w-4 h-4 text-gray-400' />
        </button>
      </div>
    </div>
  );
};
export default Toast;
