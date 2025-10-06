'use client';
import { useState, useEffect } from 'react';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}
export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'ri-check-line text-green-600',
      title: 'text-green-800',
      message: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'ri-error-warning-line text-red-600',
      title: 'text-red-800',
      message: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'ri-alert-line text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'ri-information-line text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
    },
  };
  const styles = typeStyles[toast.type];
  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
        ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4
        flex items-start space-x-3
      `}
      >
        <div className={`w-5 h-5 flex-shrink-0 ${styles.icon}`}>
          <i className='text-lg'></i>
        </div>
        <div className='flex-1 min-w-0'>
          <h4 className={`text-sm font-medium ${styles.title}`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className={`text-sm mt-1 ${styles.message}`}>{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className='flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <i className='ri-close-line text-lg'></i>
        </button>
      </div>
    </div>
  );
}
// Toast container
export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
// Toast hook
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };
  const showError = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };
  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };
  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };
  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
