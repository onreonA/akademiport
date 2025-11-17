import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/shared/utils/logger';
import { NotificationService } from '@/5-shared/services/notification';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';

export class RescheduleAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private notificationService?: NotificationService,
    private userRepository?: IUserRepository
  ) {}

  async execute(
    appointmentId: string,
    newStartTime: Date,
    newEndTime: Date,
    rescheduledBy: string
  ): Promise<Result<{ oldId: string; newId: string }>> {
    try {
      if (!appointmentId || appointmentId.trim().length === 0) {
        return Result.fail(new AppError('Appointment ID is required', 400));
      }

      if (!rescheduledBy || rescheduledBy.trim().length === 0) {
        return Result.fail(new AppError('Rescheduler ID is required', 400));
      }

      // Check if appointment exists
      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        return Result.fail(new AppError('Appointment not found', 404));
      }

      // Check if appointment can be rescheduled
      if (appointment.status !== 'pending' && appointment.status !== 'approved') {
        return Result.fail(
          new AppError(
            `Appointment cannot be rescheduled. Current status: ${appointment.status}`,
            400
          )
        );
      }

      // Validation: New times must be in the future
      if (newStartTime.getTime() <= Date.now()) {
        return Result.fail(new AppError('Yeni başlangıç tarihi geçmişte olamaz', 400));
      }

      // Validation: Start time must be before end time
      if (newStartTime >= newEndTime) {
        return Result.fail(new AppError('Başlangıç tarihi bitiş tarihinden önce olmalıdır', 400));
      }

      // Validation: Minimum duration (15 minutes)
      const durationMinutes = (newEndTime.getTime() - newStartTime.getTime()) / (1000 * 60);
      if (durationMinutes < 15) {
        return Result.fail(new AppError('Randevu süresi en az 15 dakika olmalıdır', 400));
      }

      // Conflict detection: Consultant'ın yeni saatte başka randevusu var mı?
      const conflicts = await this.appointmentRepository.findConflictingAppointments(
        appointment.consultantId,
        newStartTime,
        newEndTime,
        appointmentId // Exclude current appointment
      );

      if (conflicts.length > 0) {
        const conflictTimes = conflicts
          .map(
            (c) => `${c.startTime.toLocaleString('tr-TR')} - ${c.endTime.toLocaleString('tr-TR')}`
          )
          .join(', ');
        return Result.fail(
          new AppError(
            `Danışmanın bu saatte başka bir randevusu bulunmaktadır: ${conflictTimes}`,
            409
          )
        );
      }

      // Reschedule appointment
      const result = await this.appointmentRepository.reschedule(
        appointmentId,
        newStartTime,
        newEndTime,
        rescheduledBy
      );

      // Send notification to both parties if service is available
      if (this.notificationService) {
        try {
          // Get consultant name if userRepository is available
          let consultantName = 'Danışman';
          if (this.userRepository) {
            const consultantResult = await this.userRepository.findById(appointment.consultantId);
            if (consultantResult.isSuccess && consultantResult.value) {
              consultantName = consultantResult.value.fullName || consultantName;
            }
          }

          // Send notification to company user
          await this.notificationService.sendAppointmentRescheduled(
            appointment.requestedBy,
            result.new.id,
            consultantName,
            appointment.startTime,
            result.new.startTime
          );

          // Send notification to consultant
          await this.notificationService.sendAppointmentRescheduled(
            appointment.consultantId,
            result.new.id,
            consultantName,
            appointment.startTime,
            result.new.startTime
          );
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send appointment rescheduled notification', {
            error,
            appointmentId: result.new.id,
          });
        }
      }

      logger.info('Appointment rescheduled successfully', {
        oldAppointmentId: result.old.id,
        newAppointmentId: result.new.id,
        rescheduledBy,
      });

      return Result.ok({
        oldId: result.old.id,
        newId: result.new.id,
      });
    } catch (error) {
      logger.error('Error rescheduling appointment:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to reschedule appointment',
          500
        )
      );
    }
  }
}
