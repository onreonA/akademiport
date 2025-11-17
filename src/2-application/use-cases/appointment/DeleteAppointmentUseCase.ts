import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/shared/utils/logger';
import { NotificationService } from '@/5-shared/services/notification';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';

export class DeleteAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private notificationService?: NotificationService,
    private userRepository?: IUserRepository
  ) {}

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

          // Determine who cancelled (based on who deleted - this would need to be passed as parameter)
          // For now, assume company cancelled
          const cancelledBy: 'consultant' | 'company' = 'company';

          // Send notification to consultant
          await this.notificationService.sendAppointmentCancelled(
            appointment.consultantId,
            appointmentId,
            consultantName,
            appointment.startTime,
            cancelledBy
          );

          // Send notification to company user
          await this.notificationService.sendAppointmentCancelled(
            appointment.requestedBy,
            appointmentId,
            consultantName,
            appointment.startTime,
            cancelledBy
          );
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send appointment cancelled notification', {
            error,
            appointmentId,
          });
        }
      }

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
