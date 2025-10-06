// Notification Service - Helper functions for creating notifications
import { createClient } from '@/lib/supabase/server';
export interface CreateNotificationData {
  user_id: string;
  company_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?:
    | 'general'
    | 'education'
    | 'gamification'
    | 'system'
    | 'assignment'
    | 'project'
    | 'appointment'
    | 'document';
  icon?: string;
  color?: string;
  data?: any;
  action_url?: string;
  priority?: number;
}
export class NotificationService {
  private supabase = createClient();
  /**
   * Create a single notification
   */
  async createNotification(data: CreateNotificationData) {
    try {
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          company_id: data.company_id,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          category: data.category || 'general',
          icon: data.icon,
          color: data.color,
          data: data.data || {},
          action_url: data.action_url,
          priority: data.priority || 1,
        })
        .select()
        .single();
      if (error) {
        return null;
      }
      return notification;
    } catch (error) {
      return null;
    }
  }
  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(notifications: CreateNotificationData[]) {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert(
          notifications.map(notif => ({
            user_id: notif.user_id,
            company_id: notif.company_id,
            title: notif.title,
            message: notif.message,
            type: notif.type || 'info',
            category: notif.category || 'general',
            icon: notif.icon,
            color: notif.color,
            data: notif.data || {},
            action_url: notif.action_url,
            priority: notif.priority || 1,
          }))
        )
        .select();
      if (error) {
        return [];
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Create notification for all users in a company
   */
  async createCompanyNotification(
    companyId: string,
    notificationData: Omit<CreateNotificationData, 'user_id' | 'company_id'>
  ) {
    try {
      // Get all users in the company
      const { data: companyUsers, error: usersError } = await this.supabase
        .from('company_users')
        .select('email, company_id')
        .eq('company_id', companyId);
      if (usersError) {
        return [];
      }
      // Also get the main company user
      const { data: company, error: companyError } = await this.supabase
        .from('companies')
        .select('email, id')
        .eq('id', companyId)
        .single();
      if (companyError) {
        return [];
      }
      // Combine all users
      const allUsers = [
        { email: company.email, company_id: company.id },
        ...(companyUsers || []),
      ];
      // Create notifications for all users
      const notifications = allUsers.map(user => ({
        ...notificationData,
        user_id: user.email,
        company_id: user.company_id,
      }));
      return await this.createBulkNotifications(notifications);
    } catch (error) {
      return [];
    }
  }
  /**
   * Create system-wide notification for all companies
   */
  async createSystemNotification(
    notificationData: Omit<CreateNotificationData, 'user_id' | 'company_id'>
  ) {
    try {
      // Get all companies
      const { data: companies, error: companiesError } = await this.supabase
        .from('companies')
        .select('id, email');
      if (companiesError) {
        return [];
      }
      // Create notifications for all companies
      const notifications =
        companies?.map(company => ({
          ...notificationData,
          user_id: company.email,
          company_id: company.id,
        })) || [];
      return await this.createBulkNotifications(notifications);
    } catch (error) {
      return [];
    }
  }
  /**
   * Mark notifications as read
   */
  async markAsRead(
    notificationIds: string[],
    userId: string,
    companyId: string
  ) {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', notificationIds)
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .select();
      if (error) {
        return [];
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string, companyId: string) {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .is('read_at', null);
      if (error) {
        return 0;
      }
      return count || 0;
    } catch (error) {
      return 0;
    }
  }
}
// Predefined notification templates
export const NotificationTemplates = {
  // Project notifications
  projectAssigned: (projectName: string, companyName: string) => ({
    title: 'Yeni Proje Atandı',
    message: `${companyName} firmasına "${projectName}" projesi atandı.`,
    type: 'info' as const,
    category: 'project' as const,
    icon: 'ri-project-line',
    color: 'blue',
  }),
  projectCompleted: (projectName: string, companyName: string) => ({
    title: 'Proje Tamamlandı',
    message: `${companyName} firmasının "${projectName}" projesi başarıyla tamamlandı.`,
    type: 'success' as const,
    category: 'project' as const,
    icon: 'ri-check-line',
    color: 'green',
  }),
  // Education notifications
  educationAssigned: (educationName: string, companyName: string) => ({
    title: 'Yeni Eğitim Atandı',
    message: `${companyName} firmasına "${educationName}" eğitimi atandı.`,
    type: 'info' as const,
    category: 'education' as const,
    icon: 'ri-book-line',
    color: 'purple',
  }),
  educationCompleted: (educationName: string, companyName: string) => ({
    title: 'Eğitim Tamamlandı',
    message: `${companyName} firması "${educationName}" eğitimini tamamladı.`,
    type: 'success' as const,
    category: 'education' as const,
    icon: 'ri-graduation-cap-line',
    color: 'green',
  }),
  // Appointment notifications
  appointmentScheduled: (consultantName: string, date: string) => ({
    title: 'Randevu Planlandı',
    message: `${consultantName} ile ${date} tarihinde randevu planlandı.`,
    type: 'info' as const,
    category: 'appointment' as const,
    icon: 'ri-calendar-line',
    color: 'blue',
  }),
  appointmentReminder: (consultantName: string, time: string) => ({
    title: 'Randevu Hatırlatması',
    message: `${consultantName} ile ${time} saatinde randevunuz var.`,
    type: 'warning' as const,
    category: 'appointment' as const,
    icon: 'ri-time-line',
    color: 'orange',
  }),
  // Document notifications
  documentUploaded: (documentName: string, companyName: string) => ({
    title: 'Yeni Belge Yüklendi',
    message: `${companyName} firması "${documentName}" belgesini yükledi.`,
    type: 'info' as const,
    category: 'document' as const,
    icon: 'ri-file-line',
    color: 'blue',
  }),
  documentApproved: (documentName: string) => ({
    title: 'Belge Onaylandı',
    message: `"${documentName}" belgeniz onaylandı.`,
    type: 'success' as const,
    category: 'document' as const,
    icon: 'ri-check-line',
    color: 'green',
  }),
  documentRejected: (documentName: string, reason?: string) => ({
    title: 'Belge Reddedildi',
    message: `"${documentName}" belgeniz reddedildi.${reason ? ` Sebep: ${reason}` : ''}`,
    type: 'error' as const,
    category: 'document' as const,
    icon: 'ri-close-line',
    color: 'red',
  }),
  // System notifications
  systemMaintenance: (startTime: string, endTime: string) => ({
    title: 'Sistem Bakımı',
    message: `Sistem ${startTime} - ${endTime} saatleri arasında bakımda olacak.`,
    type: 'warning' as const,
    category: 'system' as const,
    icon: 'ri-tools-line',
    color: 'orange',
  }),
  systemUpdate: (version: string) => ({
    title: 'Sistem Güncellemesi',
    message: `Sistem ${version} sürümüne güncellendi. Yeni özellikler eklendi.`,
    type: 'info' as const,
    category: 'system' as const,
    icon: 'ri-download-line',
    color: 'blue',
  }),
};
// Export singleton instance
export const notificationService = new NotificationService();
