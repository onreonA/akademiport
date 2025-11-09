import { IAppointmentRepository } from '@/domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { logger } from '@/shared/utils/logger';

export class GetAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(appointmentId: string): Promise<Result<any>> {
    try {
      if (!appointmentId || appointmentId.trim().length === 0) {
        return Result.fail(new AppError('Appointment ID is required', 400));
      }

      const appointment = await this.appointmentRepository.findById(appointmentId);

      if (!appointment) {
        return Result.fail(new AppError('Appointment not found', 404));
      }

      return Result.ok(appointment);
    } catch (error) {
      logger.error('Error getting appointment:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to get appointment', 500)
      );
    }
  }
}
