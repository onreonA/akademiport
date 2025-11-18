/**
 * Performance Utilities
 *
 * Performance monitoring ve optimization için yardımcı fonksiyonlar
 */

/**
 * Measure function execution time
 */
export function measurePerformance<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
  const start = performance.now();

  return Promise.resolve(fn()).then((result) => {
    const end = performance.now();
    const duration = end - start;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    // Log to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(duration),
      });
    }

    return result;
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load image
 */
export function lazyLoadImage(
  imageElement: HTMLImageElement,
  src: string,
  placeholder?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (placeholder) {
      imageElement.src = placeholder;
    }

    const img = new Image();
    img.onload = () => {
      imageElement.src = src;
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload resource
 */
export function preloadResource(href: string, as: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Prefetch resource
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Get Core Web Vitals
 */
export function getCoreWebVitals(): Promise<{
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({});
      return;
    }

    const vitals: any = {};

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    }

    // First Contentful Paint (FCP) and Time to First Byte (TTFB)
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          vitals.fcp = entry.startTime;
        }
      });

      const navigationEntry = window.performance.getEntriesByType('navigation')[0] as any;
      if (navigationEntry) {
        vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }
    }

    // Resolve after a short delay to allow metrics to be collected
    setTimeout(() => resolve(vitals), 2000);
  });
}

/**
 * Report Core Web Vitals to analytics
 */
export function reportCoreWebVitals(): void {
  if (typeof window === 'undefined') return;

  getCoreWebVitals().then((vitals) => {
    if ((window as any).gtag) {
      Object.entries(vitals).forEach(([metric, value]) => {
        if (value !== undefined) {
          (window as any).gtag('event', metric, {
            event_category: 'Web Vitals',
            value: Math.round(value),
            non_interaction: true,
          });
        }
      });
    }
  });
}
