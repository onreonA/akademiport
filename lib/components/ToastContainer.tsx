'use client';
import { createContext, ReactNode, useContext } from 'react';

import { Toast as ToastType, useToast } from '../hooks/useToast';

import Toast from './Toast';
interface ToastContextType {
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
interface ToastProviderProps {
  children: ReactNode;
}
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, addToast, removeToast, clearAllToasts } = useToast();
  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};
interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}
const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;
  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
