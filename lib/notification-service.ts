'use client';
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
}
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private constructor() {
    this.checkPermission();
  }
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  private async checkPermission(): Promise<void> {
    // Server-side rendering kontrolü
    if (typeof window === 'undefined') {
      return;
    }
    if (!('Notification' in window)) {
      return;
    }
    this.permission = Notification.permission;
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }
  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }
  public async showNotification(options: NotificationOptions): Promise<void> {
    // Server-side rendering kontrolü
    if (typeof window === 'undefined') {
      return;
    }
    if (!('Notification' in window)) {
      return;
    }
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        return;
      }
    }
    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        data: options.data,
      });
      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Handle navigation if data contains URL
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };
    } catch (error) {}
  }
  public async showAppointmentStatusNotification(
    status: string,
    appointmentTitle: string
  ): Promise<void> {
    const statusText = this.getStatusText(status);
    const icon = this.getStatusIcon(status);
    await this.showNotification({
      title: `Randevu ${statusText}`,
      body: `"${appointmentTitle}" randevunuz ${statusText.toLowerCase()}.`,
      icon,
      tag: 'appointment-status',
      data: {
        type: 'appointment-status',
        status,
        url: '/firma/randevularim',
      },
    });
  }
  public async showConsultantAssignedNotification(
    consultantName: string,
    appointmentTitle: string
  ): Promise<void> {
    await this.showNotification({
      title: 'Danışman Atandı',
      body: `"${appointmentTitle}" randevunuza ${consultantName} danışmanı atandı.`,
      icon: '/icons/consultant.png',
      tag: 'consultant-assigned',
      data: {
        type: 'consultant-assigned',
        url: '/firma/randevularim',
      },
    });
  }
  public async showNewAppointmentNotification(
    companyName: string,
    appointmentTitle: string
  ): Promise<void> {
    await this.showNotification({
      title: 'Yeni Randevu Talebi',
      body: `${companyName} firmasından yeni randevu talebi: "${appointmentTitle}"`,
      icon: '/icons/new-appointment.png',
      tag: 'new-appointment',
      data: {
        type: 'new-appointment',
        url: '/admin/randevu-talepleri',
      },
    });
  }
  private getStatusText(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      case 'pending':
        return 'Beklemede';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Güncellendi';
    }
  }
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'confirmed':
        return '/icons/confirmed.png';
      case 'rejected':
        return '/icons/rejected.png';
      case 'pending':
        return '/icons/pending.png';
      case 'completed':
        return '/icons/completed.png';
      case 'cancelled':
        return '/icons/cancelled.png';
      default:
        return '/favicon.ico';
    }
  }
  public isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return 'Notification' in window;
  }
  public getPermission(): NotificationPermission {
    return this.permission;
  }
}
// Export singleton instance
export const notificationService = NotificationService.getInstance();
