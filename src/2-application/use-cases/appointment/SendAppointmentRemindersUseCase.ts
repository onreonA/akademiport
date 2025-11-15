import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { IReminderRepository } from '@/3-domain/interfaces/repositories/IReminderRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import {
  NotificationService,
  NotificationRecipient,
} from '@/infrastructure/external/notification.service';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { logger } from '@/shared/utils/logger';

export type ReminderType = '24hours' | '1hour';

export interface SendAppointmentRemindersResult {
  appointmentsProcessed: number;
  remindersSent: number;
  remindersFailed: number;
  errors: Array<{ appointmentId: string; error: string }>;
}

export class SendAppointmentRemindersUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository,
    private reminderRepository: IReminderRepository
  ) {}

  async execute(reminderType: ReminderType): Promise<Result<SendAppointmentRemindersResult>> {
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

      // Find appointments starting within the time window
      const windowStart = new Date(targetTime.getTime() - timeWindow * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + timeWindow * 60 * 1000);

      const appointments = await this.appointmentRepository.findByDateRange(
        windowStart,
        windowEnd,
        {}
      );

      // Filter appointments that match the exact reminder time and are approved
      const appointmentsToRemind = appointments.filter((appointment) => {
        // Only send reminders for approved appointments
        if (appointment.status !== 'approved') {
          return false;
        }

        const appointmentStart = new Date(appointment.startTime);
        const diffMinutes = Math.abs(
          (appointmentStart.getTime() - targetTime.getTime()) / (1000 * 60)
        );
        return diffMinutes <= timeWindow / 2; // Within half the window
      });

      logger.info(
        `Found ${appointmentsToRemind.length} appointments to send ${reminderType} reminders for`
      );

      const result: SendAppointmentRemindersResult = {
        appointmentsProcessed: appointmentsToRemind.length,
        remindersSent: 0,
        remindersFailed: 0,
        errors: [],
      };

      // Process each appointment
      for (const appointment of appointmentsToRemind) {
        try {
          // Get consultant user details
          const consultantResult = await this.userRepository.findById(appointment.consultantId);
          if (consultantResult.isFailure || !consultantResult.value) {
            logger.warn(
              `Consultant ${appointment.consultantId} not found for appointment ${appointment.id}`
            );
            continue;
          }
          const consultant = consultantResult.value;

          // Get company details
          const companyResult = await this.companyRepository.findById(appointment.companyId);
          if (companyResult.isFailure || !companyResult.value) {
            logger.warn(
              `Company ${appointment.companyId} not found for appointment ${appointment.id}`
            );
            continue;
          }
          const company = companyResult.value;

          // Get company user (requestedBy)
          const companyUserResult = await this.userRepository.findById(appointment.requestedBy);
          if (companyUserResult.isFailure || !companyUserResult.value) {
            logger.warn(
              `Company user ${appointment.requestedBy} not found for appointment ${appointment.id}`
            );
            continue;
          }
          const companyUser = companyUserResult.value;

          // Prepare recipients: both consultant and company user
          const recipients: NotificationRecipient[] = [];

          // Add consultant (check for duplicate first)
          if (consultant.email) {
            const consultantAlreadySent =
              await this.reminderRepository.hasAppointmentReminderBeenSent(
                appointment.id,
                consultant.id,
                reminderType
              );

            if (!consultantAlreadySent) {
              recipients.push({
                email: consultant.email,
                name: consultant.fullName,
                userId: consultant.id,
                phoneNumber: consultant.phone || undefined,
              });
            } else {
              logger.info(
                `Reminder already sent to consultant ${consultant.id} for appointment ${appointment.id} (${reminderType})`
              );
            }
          }

          // Add company user (check for duplicate first)
          if (companyUser.email) {
            const companyUserAlreadySent =
              await this.reminderRepository.hasAppointmentReminderBeenSent(
                appointment.id,
                companyUser.id,
                reminderType
              );

            if (!companyUserAlreadySent) {
              recipients.push({
                email: companyUser.email,
                name: companyUser.fullName,
                userId: companyUser.id,
                phoneNumber: companyUser.phone || undefined,
              });
            } else {
              logger.info(
                `Reminder already sent to company user ${companyUser.id} for appointment ${appointment.id} (${reminderType})`
              );
            }
          }

          if (recipients.length === 0) {
            logger.info(
              `Appointment ${appointment.id} has no new recipients for ${reminderType} reminder`
            );
            continue;
          }

          // Send reminders to all recipients
          const notificationReminderType: '1day' | '1hour' =
            reminderType === '24hours' ? '1day' : '1hour';

          // Send reminder to each recipient
          let sentCount = 0;
          let failedCount = 0;

          for (const recipient of recipients) {
            try {
              const notificationResult = await NotificationService.sendAppointmentReminder(
                recipient,
                {
                  appointmentTitle: appointment.title,
                  appointmentDate: new Date(appointment.startTime),
                  appointmentTime: new Date(appointment.startTime).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  zoomJoinUrl: appointment.zoomJoinUrl || undefined,
                  zoomPassword: appointment.zoomPassword || undefined,
                  consultantName: consultant.fullName,
                  companyName: company.name,
                  status: 'confirmed',
                  notes: appointment.notes || undefined,
                },
                notificationReminderType
              );

              // Record reminder in database
              try {
                const recipientResult = notificationResult.errors?.find(
                  (e) => e.recipient === recipient.email
                );

                await this.reminderRepository.createAppointmentReminder({
                  appointmentId: appointment.id,
                  userId: recipient.userId || '',
                  reminderType,
                  sentToEmail: recipient.email,
                  status: recipientResult ? 'failed' : 'sent',
                  errorMessage: recipientResult?.error,
                });
              } catch (error) {
                logger.warn(`Failed to record reminder for ${recipient.email}:`, error);
              }

              if (notificationResult.success) {
                sentCount += notificationResult.sentCount;
                failedCount += notificationResult.failedCount || 0;
              } else {
                failedCount += 1;
                result.errors.push({
                  appointmentId: appointment.id,
                  error: notificationResult.errors?.[0]?.error || 'Failed to send reminder',
                });
              }
            } catch (error) {
              failedCount += 1;
              result.errors.push({
                appointmentId: appointment.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
              logger.error(
                `Error sending reminder to ${recipient.email} for appointment ${appointment.id}:`,
                error
              );
            }
          }

          result.remindersSent += sentCount;
          result.remindersFailed += failedCount;

          if (sentCount > 0) {
            logger.info(
              `Sent ${sentCount} reminders for appointment ${appointment.id} (${failedCount} failed)`
            );
          }
        } catch (error) {
          result.remindersFailed += 1;
          result.errors.push({
            appointmentId: appointment.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          logger.error(`Error processing appointment ${appointment.id} for reminders:`, error);
        }
      }

      return Result.ok(result);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to send appointment reminders',
          500
        )
      );
    }
  }
}
