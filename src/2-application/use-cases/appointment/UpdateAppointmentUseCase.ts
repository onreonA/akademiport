import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { UpdateAppointmentDto } from '@/3-domain/entities/Appointment';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/shared/utils/logger';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class UpdateAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(appointmentId: string, data: UpdateAppointmentDto): Promise<Result<any>> {
    try {
      if (!appointmentId || appointmentId.trim().length === 0) {
        return Result.fail(new AppError('Appointment ID is required', 400));
      }

      // Check if appointment exists
      const existingAppointment = await this.appointmentRepository.findById(appointmentId);
      if (!existingAppointment) {
        return Result.fail(new AppError('Appointment not found', 404));
      }

      // Check if appointment is being marked as attended
      const isBeingMarkedAsAttended =
        data.attendedAt && !existingAppointment.attendedAt && existingAppointment.companyId;

      // Conflict detection if time is being changed
      if (data.startTime || data.endTime) {
        const startTime = data.startTime ? new Date(data.startTime) : existingAppointment.startTime;
        const endTime = data.endTime ? new Date(data.endTime) : existingAppointment.endTime;

        const conflicts = await this.appointmentRepository.findConflictingAppointments(
          existingAppointment.consultantId,
          startTime,
          endTime,
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
      }

      // Convert string dates to Date objects if provided
      const updateData: UpdateAppointmentDto = {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      };

      const updatedAppointment = await this.appointmentRepository.update(appointmentId, updateData);

      // Add leaderboard score if appointment was marked as attended
      if (isBeingMarkedAsAttended && this.addLeaderboardScore && existingAppointment.companyId) {
        await this.addLeaderboardScore.execute({
          companyId: existingAppointment.companyId,
          activityType: ActivityType.APPOINTMENT_COMPLETED,
          activityId: appointmentId,
          metadata: {
            appointmentId,
            consultantId: existingAppointment.consultantId,
            attendedAt: updatedAppointment.attendedAt?.toISOString(),
          },
        });
      }

      logger.info('Appointment updated successfully', {
        appointmentId: updatedAppointment.id,
      });

      return Result.ok(updatedAppointment);
    } catch (error) {
      logger.error('Error updating appointment:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update appointment', 500)
      );
    }
  }
}
