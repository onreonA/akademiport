// =====================================================
// TOAST HOOK
// =====================================================
// Toast notification hook'u
'use client';
import { useCallback, useState } from 'react';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };
    setToasts(prev => [...prev, newToast]);
    // Auto remove after duration
    if ((newToast.duration || 0) > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration || 3000);
    }
    return id;
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);
  const showSuccess = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'success', title, message, ...options });
    },
    [addToast]
  );
  const showError = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'error', title, message, ...options });
    },
    [addToast]
  );
  const showWarning = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'warning', title, message, ...options });
    },
    [addToast]
  );
  const showInfo = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'info', title, message, ...options });
    },
    [addToast]
  );
  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
