import { IAppointmentRepository } from '@/domain/interfaces/repositories/IAppointmentRepository';
import { CreateAppointmentDto } from '@/domain/entities/Appointment';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { AppointmentEntity } from '@/domain/entities/Appointment';
import { logger } from '@/shared/utils/logger';

export class CreateAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(data: CreateAppointmentDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const validationErrors = AppointmentEntity.validate({
        consultantId: data.consultantId,
        companyId: data.companyId,
        programId: data.programId || null,
        title: data.title,
        description: data.description || null,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        timezone: data.timezone || 'Europe/Istanbul',
        requestedBy: data.requestedBy,
        companyNotes: data.companyNotes || null,
      });

      if (validationErrors.length > 0) {
        return Result.fail(new AppError(validationErrors.join(', '), 400));
      }

      // Conflict detection: Consultant'ın bu saatte başka randevusu var mı?
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const conflicts = await this.appointmentRepository.findConflictingAppointments(
        data.consultantId,
        startTime,
        endTime
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

      // Create appointment
      const appointment = await this.appointmentRepository.create({
        ...data,
        startTime: startTime,
        endTime: endTime,
      });

      logger.info('Appointment created successfully', {
        appointmentId: appointment.id,
        consultantId: appointment.consultantId,
        companyId: appointment.companyId,
      });

      return Result.ok({
        id: appointment.id,
      });
    } catch (error) {
      logger.error('Error creating appointment:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to create appointment', 500)
      );
    }
  }
}
