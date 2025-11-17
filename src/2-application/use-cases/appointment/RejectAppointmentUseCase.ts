import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/shared/utils/logger';
import { NotificationService } from '@/5-shared/services/notification';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';

export class RejectAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private notificationService?: NotificationService,
    private userRepository?: IUserRepository
  ) {}

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

      // Send notification to company user if service is available
      if (this.notificationService) {
        try {
          // Get consultant name if userRepository is available
          let consultantName = 'Danışman';
          if (this.userRepository) {
            const consultantResult = await this.userRepository.findById(
              rejectedAppointment.consultantId
            );
            if (consultantResult.isSuccess && consultantResult.value) {
              consultantName = consultantResult.value.fullName || consultantName;
            }
          }

          // Determine who cancelled (consultant or company)
          const cancelledBy =
            rejectedBy === rejectedAppointment.consultantId ? 'consultant' : 'company';

          // Send notification to the other party
          const notifyUserId =
            cancelledBy === 'consultant'
              ? rejectedAppointment.requestedBy
              : rejectedAppointment.consultantId;

          await this.notificationService.sendAppointmentCancelled(
            notifyUserId,
            rejectedAppointment.id,
            consultantName,
            rejectedAppointment.startTime,
            cancelledBy
          );
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send appointment rejected notification', {
            error,
            appointmentId: rejectedAppointment.id,
          });
        }
      }

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
