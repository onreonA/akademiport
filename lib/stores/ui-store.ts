// =====================================================
// UI STORE - ZUSTAND
// =====================================================
// UI state management with Zustand
'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
export interface Modal {
  id: string;
  type: string;
  isOpen: boolean;
  data?: any;
  onClose?: () => void;
}
interface UIState {
  // Loading States
  globalLoading: boolean;
  pageLoading: boolean;
  loadingStates: Record<string, boolean>;
  // Toast Notifications
  toasts: Toast[];
  // Modals
  modals: Modal[];
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  // Theme
  theme: 'light' | 'dark' | 'system';
  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  clearLoadingStates: () => void;
  // Actions - Toast
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  // Actions - Modal
  openModal: (type: string, data?: any, onClose?: () => void) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  // Reset
  reset: () => void;
}
export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    // Initial State
    globalLoading: false,
    pageLoading: false,
    loadingStates: {},
    toasts: [],
    modals: [],
    sidebarOpen: true,
    sidebarCollapsed: false,
    theme: 'light',
    // Loading Actions
    setGlobalLoading: loading =>
      set(state => {
        state.globalLoading = loading;
      }),
    setPageLoading: loading =>
      set(state => {
        state.pageLoading = loading;
      }),
    setLoadingState: (key, loading) =>
      set(state => {
        state.loadingStates[key] = loading;
      }),
    clearLoadingStates: () =>
      set(state => {
        state.loadingStates = {};
      }),
    // Toast Actions
    addToast: toast => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration || 5000,
      };
      set(state => {
        state.toasts.push(newToast);
      });
      // Auto remove after duration
      if ((newToast.duration || 0) > 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, newToast.duration || 3000);
      }
      return id;
    },
    removeToast: id =>
      set(state => {
        state.toasts = state.toasts.filter(toast => toast.id !== id);
      }),
    clearToasts: () =>
      set(state => {
        state.toasts = [];
      }),
    showSuccess: (title, message) => {
      return get().addToast({ type: 'success', title, message });
    },
    showError: (title, message) => {
      return get().addToast({ type: 'error', title, message });
    },
    showWarning: (title, message) => {
      return get().addToast({ type: 'warning', title, message });
    },
    showInfo: (title, message) => {
      return get().addToast({ type: 'info', title, message });
    },
    // Modal Actions
    openModal: (type, data, onClose) => {
      const id = Math.random().toString(36).substr(2, 9);
      const modal: Modal = {
        id,
        type,
        isOpen: true,
        data,
        onClose,
      };
      set(state => {
        state.modals.push(modal);
      });
      return id;
    },
    closeModal: id =>
      set(state => {
        const modal = state.modals.find(m => m.id === id);
        if (modal) {
          modal.isOpen = false;
          if (modal.onClose) {
            modal.onClose();
          }
          // Remove from array after animation
          setTimeout(() => {
            set(state => {
              state.modals = state.modals.filter(m => m.id !== id);
            });
          }, 300);
        }
      }),
    closeAllModals: () =>
      set(state => {
        state.modals.forEach(modal => {
          modal.isOpen = false;
          if (modal.onClose) {
            modal.onClose();
          }
        });
        state.modals = [];
      }),
    // Sidebar Actions
    toggleSidebar: () =>
      set(state => {
        state.sidebarOpen = !state.sidebarOpen;
      }),
    setSidebarOpen: open =>
      set(state => {
        state.sidebarOpen = open;
      }),
    setSidebarCollapsed: collapsed =>
      set(state => {
        state.sidebarCollapsed = collapsed;
      }),
    // Theme Actions
    setTheme: theme =>
      set(state => {
        state.theme = theme;
      }),
    // Reset
    reset: () =>
      set(state => {
        state.globalLoading = false;
        state.pageLoading = false;
        state.loadingStates = {};
        state.toasts = [];
        state.modals = [];
        state.sidebarOpen = true;
        state.sidebarCollapsed = false;
        state.theme = 'light';
      }),
  }))
);
