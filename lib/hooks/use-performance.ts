// =====================================================
// PERFORMANCE HOOKS
// =====================================================
// Performance optimization hooks
'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useUIStore } from '@/lib/stores/ui-store';
// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
// Throttle hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}
// Memoized selector hook
export function useMemoizedSelector<T, R>(
  selector: (state: T) => R,
  deps: React.DependencyList = []
): R {
  return useMemo(() => selector as any, deps);
}
// Virtual scrolling hook
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight,
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);
  const totalHeight = items.length * itemHeight;
  return {
    visibleItems,
    totalHeight,
    setScrollTop,
  };
}
// Intersection observer hook
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    observer.observe(element);
    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);
  return isIntersecting;
}
// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderStart = useRef<number>(0);
  const { showInfo } = useUIStore();
  useEffect(() => {
    renderStart.current = performance.now();
  });
  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    if (renderTime > 16) {
      // More than one frame (16ms)
      // Performance warning disabled for production
    }
  });
  const measureAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationName: string
    ): Promise<T> => {
      const start = performance.now();
      try {
        const result = await operation();
        const duration = performance.now() - start;
        if (duration > 1000) {
          // More than 1 second
          showInfo(
            'Slow Operation',
            `${operationName} took ${duration.toFixed(2)}ms`
          );
        }
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        //   `${operationName} failed after ${duration.toFixed(2)}ms:`,
        //   error
        // );
        throw error;
      }
    },
    [showInfo]
  );
  return { measureAsync };
}
// Lazy loading hook
export function useLazyLoad<T>(
  loadFunction: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (loading || data) return;
    setLoading(true);
    setError(null);
    try {
      const result = await loadFunction();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [loadFunction, loading, data]);
  useEffect(() => {
    load();
  }, deps);
  return { data, loading, error, reload: load };
}
// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let img: HTMLImageElement;
    if (imageRef) {
      img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setLoaded(true);
      };
      img.src = src;
    }
    return () => {
      if (img) {
        img.onload = null;
      }
    };
  }, [src, imageRef]);
  return {
    imageSrc,
    loaded,
    ref: setImageRef,
  };
}
