import { IAppointmentRepository } from '@/domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { logger } from '@/shared/utils/logger';

export class DeleteAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(appointmentId: string): Promise<Result<void>> {
    try {
      if (!appointmentId || appointmentId.trim().length === 0) {
        return Result.fail(new AppError('Appointment ID is required', 400));
      }

      // Check if appointment exists
      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        return Result.fail(new AppError('Appointment not found', 404));
      }

      // Delete appointment (soft delete)
      await this.appointmentRepository.delete(appointmentId);

      logger.info('Appointment deleted successfully', {
        appointmentId,
      });

      return Result.ok(undefined);
    } catch (error) {
      logger.error('Error deleting appointment:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete appointment', 500)
      );
    }
  }
}
