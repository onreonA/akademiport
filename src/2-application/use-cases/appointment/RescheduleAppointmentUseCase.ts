import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/shared/utils/logger';

export class RescheduleAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

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
