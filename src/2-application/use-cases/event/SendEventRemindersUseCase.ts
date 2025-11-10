import { IEventRepository } from '@/domain/interfaces/repositories/IEventRepository';
import { IReminderRepository } from '@/domain/interfaces/repositories/IReminderRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import {
  NotificationService,
  NotificationRecipient,
} from '@/infrastructure/external/notification.service';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { logger } from '@/shared/utils/logger';

export type ReminderType = '24hours' | '1hour';

export interface SendEventRemindersResult {
  eventsProcessed: number;
  remindersSent: number;
  remindersFailed: number;
  errors: Array<{ eventId: string; error: string }>;
}

export class SendEventRemindersUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private userRepository: UserRepository,
    private programRepository: ProgramRepository,
    private reminderRepository: IReminderRepository
  ) {}

  async execute(reminderType: ReminderType): Promise<Result<SendEventRemindersResult>> {
    try {
      const now = new Date();
      let targetTime: Date;
      let timeWindow: number; // minutes

      // Calculate target time based on reminder type
      if (reminderType === '24hours') {
        // 24 hours from now
        targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        timeWindow = 60; // 1 hour window
      } else {
        // 1 hour from now
        targetTime = new Date(now.getTime() + 60 * 60 * 1000);
        timeWindow = 15; // 15 minute window
      }

      // Find events starting within the time window
      const windowStart = new Date(targetTime.getTime() - timeWindow * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + timeWindow * 60 * 1000);

      const events = await this.eventRepository.findByDateRange(windowStart, windowEnd, {});

      // Filter events that match the exact reminder time
      const eventsToRemind = events.filter((event) => {
        const eventStart = new Date(event.startTime);
        const diffMinutes = Math.abs((eventStart.getTime() - targetTime.getTime()) / (1000 * 60));
        return diffMinutes <= timeWindow / 2; // Within half the window
      });

      logger.info(`Found ${eventsToRemind.length} events to send ${reminderType} reminders for`);

      const result: SendEventRemindersResult = {
        eventsProcessed: eventsToRemind.length,
        remindersSent: 0,
        remindersFailed: 0,
        errors: [],
      };

      // Process each event
      for (const event of eventsToRemind) {
        try {
          // Skip if event is cancelled or completed
          if (event.status === 'cancelled' || event.status === 'completed') {
            continue;
          }

          // Get program info
          const programResult = await this.programRepository.findById(event.programId);
          const programName =
            programResult.isSuccess && programResult.value ? programResult.value.name : undefined;

          // Get attendees for this event
          const attendees = await this.eventRepository.getAttendees(event.id);

          if (attendees.length === 0) {
            logger.info(`Event ${event.id} has no attendees, skipping reminders`);
            continue;
          }

          // Get user details for attendees and check for duplicate reminders
          const recipients: NotificationRecipient[] = [];
          for (const attendee of attendees) {
            // Check if reminder was already sent
            const alreadySent = await this.reminderRepository.hasEventReminderBeenSent(
              event.id,
              attendee.userId,
              reminderType
            );

            if (alreadySent) {
              logger.debug(
                `Reminder already sent to user ${attendee.userId} for event ${event.id} (${reminderType})`
              );
              continue;
            }

            const userResult = await this.userRepository.findById(attendee.userId);
            if (userResult.isSuccess && userResult.value && userResult.value.email) {
              recipients.push({
                email: userResult.value.email,
                name: userResult.value.fullName,
                userId: attendee.userId,
                phoneNumber: userResult.value.phone || undefined,
              });
            }
          }

          if (recipients.length === 0) {
            logger.info(`Event ${event.id} has no new recipients for ${reminderType} reminder`);
            continue;
          }

          // Send reminders
          const notificationReminderType: '3days' | '1day' | '1hour' =
            reminderType === '24hours' ? '1day' : '1hour';

          const notificationResult = await NotificationService.sendEventReminder(
            recipients,
            {
              eventTitle: event.title,
              eventDescription: event.description || undefined,
              eventDate: new Date(event.startTime),
              eventTime: new Date(event.startTime).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              zoomJoinUrl: event.zoomJoinUrl || undefined,
              zoomPassword: event.zoomPassword || undefined,
              organizerName: event.organizerName || 'Etkinlik Organizatörü',
              programName: programName,
            },
            notificationReminderType
          );

          // Record reminders in database
          for (const recipient of recipients) {
            try {
              const recipientResult = notificationResult.errors?.find(
                (e) => e.recipient === recipient.email
              );

              await this.reminderRepository.createEventReminder({
                eventId: event.id,
                userId: recipient.userId || '',
                reminderType,
                sentToEmail: recipient.email,
                status: recipientResult ? 'failed' : 'sent',
                errorMessage: recipientResult?.error,
              });
            } catch (error) {
              logger.warn(`Failed to record reminder for ${recipient.email}:`, error);
            }
          }

          if (notificationResult.success) {
            result.remindersSent += notificationResult.sentCount;
            result.remindersFailed += notificationResult.failedCount || 0;
            logger.info(
              `Sent ${notificationResult.sentCount} reminders for event ${event.id} (${notificationResult.failedCount || 0} failed)`
            );
          } else {
            result.remindersFailed += recipients.length;
            result.errors.push({
              eventId: event.id,
              error: notificationResult.errors?.[0]?.error || 'Failed to send reminders',
            });
            logger.error(`Failed to send reminders for event ${event.id}`);
          }
        } catch (error) {
          result.remindersFailed += 1;
          result.errors.push({
            eventId: event.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          logger.error(`Error processing event ${event.id} for reminders:`, error);
        }
      }

      return Result.ok(result);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to send event reminders', 500)
      );
    }
  }
}
