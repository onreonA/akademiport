// =====================================================
// LAZY IMPORTS UTILITY
// =====================================================
// Dynamic imports for code splitting and lazy loading
import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';
// Lazy load heavy components
export const LazyFileUpload = dynamic(
  () => import('@/components/forms/FileUpload'),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-32 rounded-lg',
      }),
    ssr: false,
  }
);
export const LazyFileManager = dynamic(
  () => import('@/components/ui/FileManager'),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-64 rounded-lg',
      }),
    ssr: false,
  }
);
export const LazyExportImport = dynamic(
  () => import('@/components/ui/ExportImport'),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-12 rounded-lg',
      }),
    ssr: false,
  }
);
export const LazyGlobalSearch = dynamic(
  () => import('@/components/ui/GlobalSearch'),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-10 rounded-lg',
      }),
    ssr: false,
  }
);
export const LazyOptimizedDataTable = dynamic(
  () => import('@/components/ui/OptimizedDataTable'),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-64 rounded-lg',
      }),
    ssr: false,
  }
);
// Lazy load admin components
export const LazyAdminLayout = dynamic(
  () => import('@/components/admin/AdminLayout'),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-screen',
      }),
    ssr: false,
  }
);
// Lazy load firma components
export const LazyFirmaHeader = dynamic(
  () => import('@/components/firma/FirmaHeader'),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-16',
      }),
    ssr: false,
  }
);
// Lazy load charts and heavy libraries
export const LazyChart = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Line })),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-64 rounded-lg',
      }),
    ssr: false,
  }
);
// Lazy load date picker
// export const LazyDatePicker = dynamic(() => import('react-datepicker'), {
//   loading: () => React.createElement('div', { className: 'animate-pulse bg-gray-200 h-10 rounded-lg' }),
//   ssr: false
// });
// Lazy load rich text editor (if exists)
// export const LazyRichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
//   loading: () => React.createElement('div', { className: 'animate-pulse bg-gray-200 h-64 rounded-lg' }),
//   ssr: false
// });
// Utility function for dynamic imports with error boundaries
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType
) {
  return dynamic(importFn, {
    loading:
      fallback ||
      ((() =>
        React.createElement('div', {
          className: 'animate-pulse bg-gray-200 h-32 rounded-lg',
        })) as any),
    ssr: false,
  });
}
// Preload critical components
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined') {
    // Preload components that are likely to be used
    import('@/components/forms/FileUpload');
    import('@/components/ui/GlobalSearch');
    import('@/components/ui/OptimizedDataTable');
  }
}
// Lazy load with intersection observer
export function createLazyComponentWithIntersection<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options?: IntersectionObserverInit
) {
  return dynamic(importFn, {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 h-32 rounded-lg',
      }),
    ssr: false,
  });
}
