import { IAppointmentRepository } from '@/domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { logger } from '@/shared/utils/logger';

export class RejectAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(
    appointmentId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<Result<{ id: string }>> {
    try {
      if (!appointmentId || appointmentId.trim().length === 0) {
        return Result.fail(new AppError('Appointment ID is required', 400));
      }

      if (!rejectedBy || rejectedBy.trim().length === 0) {
        return Result.fail(new AppError('Rejector ID is required', 400));
      }

      // Check if appointment exists
      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        return Result.fail(new AppError('Appointment not found', 404));
      }

      // Check if appointment can be rejected
      if (appointment.status !== 'pending') {
        return Result.fail(
          new AppError(`Appointment cannot be rejected. Current status: ${appointment.status}`, 400)
        );
      }

      // Reject appointment
      const rejectedAppointment = await this.appointmentRepository.reject(
        appointmentId,
        rejectedBy,
        reason
      );

      logger.info('Appointment rejected successfully', {
        appointmentId: rejectedAppointment.id,
        rejectedBy,
        reason,
      });

      return Result.ok({
        id: rejectedAppointment.id,
      });
    } catch (error) {
      logger.error('Error rejecting appointment:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to reject appointment', 500)
      );
    }
  }
}
