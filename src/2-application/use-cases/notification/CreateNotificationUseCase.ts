/**
 * Create Notification Use Case
 *
 * Creates a new notification for a user
 */

import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import { NotificationPreferences } from '@/3-domain/entities/NotificationPreferences';
import {
  createNotification,
  shouldSendEmail,
  shouldSendPush,
} from '@/3-domain/entities/Notification';
import {
  isNotificationEnabledForChannel,
  isQuietHours,
} from '@/3-domain/entities/NotificationPreferences';
import { NotificationChannel, NotificationPriority } from '@/3-domain/enums/NotificationEnums';
import { EmailPriority } from '@/3-domain/enums/EmailEnums';
import {
  INotificationRepository,
  INotificationPreferencesRepository,
} from '@/3-domain/interfaces/repositories/INotificationRepository';
import { IEmailService } from '@/3-domain/interfaces/services/IEmailService';
import { IPushNotificationService } from '@/3-domain/interfaces/services/INotificationService';
import { CreateNotificationDto } from '@/2-application/dtos/notification/CreateNotificationDto';
import { logger } from '@/5-shared/utils/logger';

export class CreateNotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private preferencesRepository: INotificationPreferencesRepository,
    private emailService?: IEmailService,
    private pushNotificationService?: IPushNotificationService
  ) {}

  async execute(dto: CreateNotificationDto): Promise<Result<Notification>> {
    try {
      // Create notification entity
      const notification = createNotification({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        actionUrl: dto.actionUrl,
        metadata: dto.metadata || {},
        priority: dto.priority || NotificationPriority.NORMAL,
        channels: dto.channels || [NotificationChannel.IN_APP],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      });

      // Get user preferences
      const preferencesResult = await this.preferencesRepository.findByUserId(dto.userId);
      let preferences: NotificationPreferences | null = null;

      if (preferencesResult.isSuccess && preferencesResult.value) {
        preferences = preferencesResult.value;
      } else {
        // Create default preferences if not exists
        const { createDefaultNotificationPreferences } = await import(
          '@/3-domain/entities/NotificationPreferences'
        );
        preferences = createDefaultNotificationPreferences(dto.userId);
        await this.preferencesRepository.create(preferences);
      }

      // Check quiet hours
      if (preferences && isQuietHours(preferences)) {
        // Only send in-app notifications during quiet hours
        notification.channels = [NotificationChannel.IN_APP];
      }

      // Save notification to database
      const createResult = await this.notificationRepository.create(notification);
      if (createResult.isFailure) {
        return Result.fail(createResult.error || new Error('Failed to create notification'));
      }

      const savedNotification = createResult.value;

      // Send email notification if enabled
      if (
        shouldSendEmail(savedNotification) &&
        preferences &&
        isNotificationEnabledForChannel(preferences, dto.type, NotificationChannel.EMAIL) &&
        this.emailService
      ) {
        try {
          const emailResult = await this.emailService.send({
            to: dto.userId, // Will be resolved to email in service
            subject: savedNotification.title,
            html: savedNotification.message,
            priority:
              savedNotification.priority === NotificationPriority.URGENT
                ? EmailPriority.HIGH
                : EmailPriority.NORMAL,
          });

          if (emailResult.isSuccess) {
            await this.notificationRepository.update(savedNotification.id, { emailSent: true });
          }
        } catch (error) {
          logger.error('Failed to send email notification', {
            error,
            notificationId: savedNotification.id,
          });
        }
      }

      // Send push notification if enabled
      if (
        shouldSendPush(savedNotification) &&
        preferences &&
        isNotificationEnabledForChannel(preferences, dto.type, NotificationChannel.PUSH) &&
        this.pushNotificationService
      ) {
        try {
          const pushResult = await this.pushNotificationService.sendPushNotification(
            dto.userId,
            savedNotification
          );

          if (pushResult.isSuccess) {
            await this.notificationRepository.update(savedNotification.id, { pushSent: true });
          }
        } catch (error) {
          logger.error('Failed to send push notification', {
            error,
            notificationId: savedNotification.id,
          });
        }
      }

      return Result.ok(savedNotification);
    } catch (error) {
      logger.error('CreateNotificationUseCase failed', { error, dto });
      const err = error instanceof Error ? error : new Error('Failed to create notification');
      return Result.fail(err);
    }
  }
}
