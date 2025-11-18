/**
 * Analytics Provider Component
 *
 * Google Analytics 4 ve Mixpanel entegrasyonu için provider
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analyticsService } from '@/5-shared/services/analytics';
import { useAuth } from '@/5-shared/hooks/useAuth';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Initialize Google Analytics 4
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    if (ga4Id) {
      // Load gtag script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${ga4Id}', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(script2);
    }
  }, []);

  // Initialize Mixpanel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    if (mixpanelToken) {
      import('mixpanel-browser').then((mixpanel) => {
        mixpanel.default.init(mixpanelToken, {
          debug: process.env.NODE_ENV === 'development',
          track_pageview: false, // We'll track manually
        });
        (window as any).mixpanel = mixpanel.default;
      });
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (!pathname) return;

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    analyticsService.trackPageView(fullPath, document.title);
  }, [pathname, searchParams]);

  // Set user properties when user is available
  useEffect(() => {
    if (user) {
      analyticsService.setUserProperties({
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId || undefined,
        programId: user.programRoles?.[0]?.programId || undefined,
      });
    }
  }, [user]);

  return <>{children}</>;
}
