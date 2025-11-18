/**
 * Analytics Service
 *
 * Google Analytics 4 ve Mixpanel entegrasyonu için merkezi servis
 */

import { logger } from '@/5-shared/utils/logger';

export interface AnalyticsEvent {
  name: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  role?: string;
  companyId?: string;
  programId?: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isGA4Enabled: boolean;
  private isMixpanelEnabled: boolean;

  private constructor() {
    this.isGA4Enabled =
      typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    this.isMixpanelEnabled =
      typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Page view tracking
   */
  trackPageView(path: string, title?: string): void {
    if (typeof window === 'undefined') return;

    try {
      // Google Analytics 4
      if (this.isGA4Enabled && (window as any).gtag) {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
          page_path: path,
          page_title: title,
        });
      }

      // Mixpanel
      if (this.isMixpanelEnabled && (window as any).mixpanel) {
        (window as any).mixpanel.track('Page View', {
          path,
          title,
        });
      }
    } catch (error) {
      logger.error('AnalyticsService.trackPageView error:', error);
    }
  }

  /**
   * Custom event tracking
   */
  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined') return;

    try {
      const { name, category, action, label, value, properties } = event;

      // Google Analytics 4
      if (this.isGA4Enabled && (window as any).gtag) {
        (window as any).gtag('event', name, {
          event_category: category,
          event_action: action,
          event_label: label,
          value,
          ...properties,
        });
      }

      // Mixpanel
      if (this.isMixpanelEnabled && (window as any).mixpanel) {
        (window as any).mixpanel.track(name, {
          category,
          action,
          label,
          value,
          ...properties,
        });
      }
    } catch (error) {
      logger.error('AnalyticsService.trackEvent error:', error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (typeof window === 'undefined') return;

    try {
      // Google Analytics 4
      if (this.isGA4Enabled && (window as any).gtag) {
        (window as any).gtag('set', 'user_properties', {
          user_id: properties.userId,
          email: properties.email,
          role: properties.role,
          company_id: properties.companyId,
          program_id: properties.programId,
        });
      }

      // Mixpanel
      if (this.isMixpanelEnabled && (window as any).mixpanel) {
        if (properties.userId) {
          (window as any).mixpanel.identify(properties.userId);
        }
        (window as any).mixpanel.people.set({
          $email: properties.email,
          role: properties.role,
          company_id: properties.companyId,
          program_id: properties.programId,
        });
      }
    } catch (error) {
      logger.error('AnalyticsService.setUserProperties error:', error);
    }
  }

  /**
   * Track conversion
   */
  trackConversion(conversionName: string, value?: number, currency?: string): void {
    if (typeof window === 'undefined') return;

    try {
      // Google Analytics 4
      if (this.isGA4Enabled && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          send_to: conversionName,
          value,
          currency: currency || 'USD',
        });
      }

      // Mixpanel
      if (this.isMixpanelEnabled && (window as any).mixpanel) {
        (window as any).mixpanel.track('Conversion', {
          conversion_name: conversionName,
          value,
          currency: currency || 'USD',
        });
      }
    } catch (error) {
      logger.error('AnalyticsService.trackConversion error:', error);
    }
  }

  /**
   * Track dashboard view
   */
  trackDashboardView(dashboardType: 'master' | 'consultant' | 'company'): void {
    this.trackEvent({
      name: 'dashboard_view',
      category: 'dashboard',
      action: 'view',
      label: dashboardType,
      properties: {
        dashboard_type: dashboardType,
      },
    });
  }

  /**
   * Track report generation
   */
  trackReportGeneration(reportType: string, format?: string): void {
    this.trackEvent({
      name: 'report_generated',
      category: 'reports',
      action: 'generate',
      label: reportType,
      properties: {
        report_type: reportType,
        format,
      },
    });
  }

  /**
   * Track export
   */
  trackExport(type: 'dashboard' | 'report', format: 'pdf' | 'excel' | 'csv'): void {
    this.trackEvent({
      name: 'export',
      category: 'export',
      action: 'download',
      label: format,
      properties: {
        export_type: type,
        format,
      },
    });
  }

  /**
   * Track custom report creation
   */
  trackCustomReportCreated(reportId: string, reportType: string): void {
    this.trackEvent({
      name: 'custom_report_created',
      category: 'reports',
      action: 'create',
      label: reportType,
      properties: {
        report_id: reportId,
        report_type: reportType,
      },
    });
  }
}

// Singleton instance export
export const analyticsService = AnalyticsService.getInstance();
