/**
 * Notification Service
 *
 * Core notification service implementation
 */

import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import {
  INotificationService,
  CreateNotificationOptions,
} from '@/3-domain/interfaces/services/INotificationService';
import {
  INotificationRepository,
  INotificationPreferencesRepository,
} from '@/3-domain/interfaces/repositories/INotificationRepository';
import { IEmailService } from '@/3-domain/interfaces/services/IEmailService';
import { IPushNotificationService } from '@/3-domain/interfaces/services/INotificationService';
import { CreateNotificationUseCase } from '@/2-application/use-cases/notification/CreateNotificationUseCase';
import { GetNotificationsUseCase } from '@/2-application/use-cases/notification/GetNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '@/2-application/use-cases/notification/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '@/2-application/use-cases/notification/MarkAllNotificationsAsReadUseCase';
import { DeleteNotificationUseCase } from '@/2-application/use-cases/notification/DeleteNotificationUseCase';
import { GetUnreadNotificationCountUseCase } from '@/2-application/use-cases/notification/GetUnreadNotificationCountUseCase';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@/3-domain/enums/NotificationEnums';
import { logger } from '@/5-shared/utils/logger';

export class NotificationService implements INotificationService {
  private createNotificationUseCase: CreateNotificationUseCase;
  private getNotificationsUseCase: GetNotificationsUseCase;
  private markAsReadUseCase: MarkNotificationAsReadUseCase;
  private markAllAsReadUseCase: MarkAllNotificationsAsReadUseCase;
  private deleteNotificationUseCase: DeleteNotificationUseCase;
  private getUnreadCountUseCase: GetUnreadNotificationCountUseCase;

  constructor(
    notificationRepository: INotificationRepository,
    preferencesRepository: INotificationPreferencesRepository,
    emailService?: IEmailService,
    pushNotificationService?: IPushNotificationService
  ) {
    this.createNotificationUseCase = new CreateNotificationUseCase(
      notificationRepository,
      preferencesRepository,
      emailService,
      pushNotificationService
    );
    this.getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
    this.markAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository);
    this.markAllAsReadUseCase = new MarkAllNotificationsAsReadUseCase(notificationRepository);
    this.deleteNotificationUseCase = new DeleteNotificationUseCase(notificationRepository);
    this.getUnreadCountUseCase = new GetUnreadNotificationCountUseCase(notificationRepository);
  }

  async createNotification(options: CreateNotificationOptions): Promise<Result<Notification>> {
    try {
      const dto = {
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        actionUrl: options.actionUrl,
        metadata: options.metadata || {},
        priority: options.priority ?? NotificationPriority.NORMAL,
        channels: options.channels ?? [NotificationChannel.IN_APP],
        expiresAt: options.expiresAt?.toISOString(),
      };

      return await this.createNotificationUseCase.execute(dto);
    } catch (error) {
      logger.error('NotificationService.createNotification failed', { error, options });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create notification')
      );
    }
  }

  async createNotifications(
    userIds: string[],
    options: Omit<CreateNotificationOptions, 'userId'>
  ): Promise<Result<Notification[]>> {
    try {
      const results: Notification[] = [];
      const errors: Error[] = [];

      for (const userId of userIds) {
        const result = await this.createNotification({ ...options, userId });
        if (result.isSuccess) {
          results.push(result.value);
        } else {
          errors.push(result.error || new Error('Failed to create notification'));
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return Result.fail(
          new Error(`Failed to create notifications: ${errors.map((e) => e.message).join(', ')}`)
        );
      }

      return Result.ok(results);
    } catch (error) {
      logger.error('NotificationService.createNotifications failed', { error, userIds, options });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create notifications')
      );
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<Result<Notification>> {
    return await this.markAsReadUseCase.execute(notificationId, userId);
  }

  async markAllAsRead(userId: string): Promise<Result<number>> {
    return await this.markAllAsReadUseCase.execute(userId);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<Result<void>> {
    return await this.deleteNotificationUseCase.execute(notificationId, userId);
  }

  async getUserNotifications(
    userId: string,
    options?: {
      isRead?: boolean;
      type?: NotificationType;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<Notification[]>> {
    try {
      const filter = {
        userId,
        isRead: options?.isRead,
        type: options?.type,
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        orderBy: 'created_at' as const,
        orderDirection: 'desc' as const,
      };

      return await this.getNotificationsUseCase.execute(filter);
    } catch (error) {
      logger.error('NotificationService.getUserNotifications failed', { error, userId, options });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to get user notifications')
      );
    }
  }

  async getUnreadCount(userId: string): Promise<Result<number>> {
    return await this.getUnreadCountUseCase.execute(userId);
  }

  // ============================================
  // Notification Trigger Helpers
  // ============================================

  /**
   * Send task assigned notification
   */
  async sendTaskAssigned(
    userId: string,
    taskId: string,
    taskTitle: string,
    projectId?: string,
    subProjectId?: string
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Yeni Görev Atandı',
      message: `"${taskTitle}" görevi size atandı.`,
      actionUrl: `/dashboard/tasks/${taskId}`,
      metadata: {
        taskId,
        taskTitle,
        projectId,
        subProjectId,
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * Send task completed notification
   */
  async sendTaskCompleted(
    userId: string,
    taskId: string,
    taskTitle: string,
    projectId?: string,
    subProjectId?: string
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.TASK_COMPLETED,
      title: 'Görev Tamamlandı',
      message: `"${taskTitle}" görevi tamamlandı ve inceleme için gönderildi.`,
      actionUrl: `/dashboard/tasks/${taskId}`,
      metadata: {
        taskId,
        taskTitle,
        projectId,
        subProjectId,
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
    });
  }

  /**
   * Send task approved notification
   */
  async sendTaskApproved(
    userId: string,
    taskId: string,
    taskTitle: string,
    projectId?: string,
    subProjectId?: string
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.TASK_APPROVED,
      title: 'Görev Onaylandı',
      message: `"${taskTitle}" görevi onaylandı.`,
      actionUrl: `/dashboard/tasks/${taskId}`,
      metadata: {
        taskId,
        taskTitle,
        projectId,
        subProjectId,
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * Send task rejected notification
   */
  async sendTaskRejected(
    userId: string,
    taskId: string,
    taskTitle: string,
    reason?: string,
    projectId?: string,
    subProjectId?: string
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.TASK_REJECTED,
      title: 'Görev Reddedildi',
      message: reason
        ? `"${taskTitle}" görevi reddedildi. Sebep: ${reason}`
        : `"${taskTitle}" görevi reddedildi.`,
      actionUrl: `/dashboard/tasks/${taskId}`,
      metadata: {
        taskId,
        taskTitle,
        reason,
        projectId,
        subProjectId,
      },
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * Send event created notification
   */
  async sendEventCreated(
    userId: string,
    eventId: string,
    eventTitle: string
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.INFO,
      title: 'Yeni Etkinlik Oluşturuldu',
      message: `"${eventTitle}" etkinliği oluşturuldu.`,
      actionUrl: `/dashboard/events/${eventId}`,
      metadata: {
        eventId,
        eventTitle,
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
    });
  }

  /**
   * Send event updated notification
   */
  async sendEventUpdated(
    userId: string,
    eventId: string,
    eventTitle: string
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.EVENT_UPDATED,
      title: 'Etkinlik Güncellendi',
      message: `"${eventTitle}" etkinliği güncellendi.`,
      actionUrl: `/dashboard/events/${eventId}`,
      metadata: {
        eventId,
        eventTitle,
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * Send event cancelled notification
   */
  async sendEventCancelled(
    userId: string,
    eventId: string,
    eventTitle: string
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.EVENT_CANCELLED,
      title: 'Etkinlik İptal Edildi',
      message: `"${eventTitle}" etkinliği iptal edildi.`,
      actionUrl: `/dashboard/events/${eventId}`,
      metadata: {
        eventId,
        eventTitle,
      },
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * Send event reminder notification
   */
  async sendEventReminder(
    userId: string,
    eventId: string,
    eventTitle: string,
    eventDate: Date
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.EVENT_REMINDER,
      title: 'Etkinlik Hatırlatması',
      message: `"${eventTitle}" etkinliği ${eventDate.toLocaleDateString('tr-TR')} tarihinde gerçekleşecek.`,
      actionUrl: `/dashboard/events/${eventId}`,
      metadata: {
        eventId,
        eventTitle,
        eventDate: eventDate.toISOString(),
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    });
  }

  /**
   * Send appointment confirmed notification
   */
  async sendAppointmentConfirmed(
    userId: string,
    appointmentId: string,
    consultantName: string,
    appointmentDate: Date
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.APPOINTMENT_CONFIRMED,
      title: 'Randevu Onaylandı',
      message: `${consultantName} ile ${appointmentDate.toLocaleDateString('tr-TR')} tarihindeki randevunuz onaylandı.`,
      actionUrl: `/dashboard/appointments/${appointmentId}`,
      metadata: {
        appointmentId,
        consultantName,
        appointmentDate: appointmentDate.toISOString(),
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * Send appointment cancelled notification
   */
  async sendAppointmentCancelled(
    userId: string,
    appointmentId: string,
    consultantName: string,
    appointmentDate: Date,
    cancelledBy: 'consultant' | 'company'
  ): Promise<Result<Notification>> {
    const cancelledByText = cancelledBy === 'consultant' ? 'Danışman' : 'Firma';
    return await this.createNotification({
      userId,
      type: NotificationType.APPOINTMENT_CANCELLED,
      title: 'Randevu İptal Edildi',
      message: `${consultantName} ile ${appointmentDate.toLocaleDateString('tr-TR')} tarihindeki randevunuz ${cancelledByText} tarafından iptal edildi.`,
      actionUrl: `/dashboard/appointments/${appointmentId}`,
      metadata: {
        appointmentId,
        consultantName,
        appointmentDate: appointmentDate.toISOString(),
        cancelledBy,
      },
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * Send appointment rescheduled notification
   */
  async sendAppointmentRescheduled(
    userId: string,
    appointmentId: string,
    consultantName: string,
    oldDate: Date,
    newDate: Date
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      title: 'Randevu Yeniden Planlandı',
      message: `${consultantName} ile randevunuz ${oldDate.toLocaleDateString('tr-TR')} tarihinden ${newDate.toLocaleDateString('tr-TR')} tarihine taşındı.`,
      actionUrl: `/dashboard/appointments/${appointmentId}`,
      metadata: {
        appointmentId,
        consultantName,
        oldDate: oldDate.toISOString(),
        newDate: newDate.toISOString(),
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * Send appointment reminder notification
   */
  async sendAppointmentReminder(
    userId: string,
    appointmentId: string,
    consultantName: string,
    appointmentDate: Date
  ): Promise<Result<Notification>> {
    return await this.createNotification({
      userId,
      type: NotificationType.APPOINTMENT_REMINDER,
      title: 'Randevu Hatırlatması',
      message: `${consultantName} ile ${appointmentDate.toLocaleDateString('tr-TR')} tarihindeki randevunuz yaklaşıyor.`,
      actionUrl: `/dashboard/appointments/${appointmentId}`,
      metadata: {
        appointmentId,
        consultantName,
        appointmentDate: appointmentDate.toISOString(),
      },
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    });
  }
}
