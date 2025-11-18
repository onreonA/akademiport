'use client';

/**
 * Performance Tracker Component
 *
 * Core Web Vitals ve performance metriklerini takip eder
 */

import { useEffect } from 'react';
import { reportCoreWebVitals } from '@/5-shared/utils/performance';

export function PerformanceTracker() {
  useEffect(() => {
    // Report Core Web Vitals
    reportCoreWebVitals();

    // Track page load time
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;

          if ((window as any).gtag) {
            (window as any).gtag('event', 'page_load_time', {
              event_category: 'Performance',
              value: Math.round(loadTime),
              non_interaction: true,
            });
          }
        }
      });
    }
  }, []);

  return null;
}
