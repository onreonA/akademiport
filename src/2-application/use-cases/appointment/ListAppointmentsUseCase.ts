import { IAppointmentRepository } from '@/domain/interfaces/repositories/IAppointmentRepository';
import { AppointmentFilterDto } from '@/domain/entities/Appointment';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { logger } from '@/shared/utils/logger';

export class ListAppointmentsUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(filters?: AppointmentFilterDto): Promise<Result<{ data: any[]; total: number }>> {
    try {
      // Convert string dates to Date objects if provided
      const processedFilters: AppointmentFilterDto = {
        ...filters,
        startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
      };

      const result = await this.appointmentRepository.findAll(processedFilters);

      return Result.ok(result);
    } catch (error) {
      logger.error('Error listing appointments:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list appointments', 500)
      );
    }
  }
}
