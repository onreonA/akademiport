import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ZoomApiService } from '@/infrastructure/external/zoom-api.service';
import { logger } from '@/shared/utils/logger';
import { NotificationService } from '@/5-shared/services/notification';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';

export class ApproveAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private notificationService?: NotificationService,
    private userRepository?: IUserRepository
  ) {}

  async execute(
    appointmentId: string,
    approvedBy: string,
    notes?: string
  ): Promise<Result<{ id: string; zoomMeetingId?: string }>> {
    try {
      if (!appointmentId || appointmentId.trim().length === 0) {
        return Result.fail(new AppError('Appointment ID is required', 400));
      }

      if (!approvedBy || approvedBy.trim().length === 0) {
        return Result.fail(new AppError('Approver ID is required', 400));
      }

      // Check if appointment exists
      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        return Result.fail(new AppError('Appointment not found', 404));
      }

      // Check if appointment can be approved
      if (appointment.status !== 'pending') {
        return Result.fail(
          new AppError(`Appointment cannot be approved. Current status: ${appointment.status}`, 400)
        );
      }

      // Approve appointment
      const approvedAppointment = await this.appointmentRepository.approve(
        appointmentId,
        approvedBy,
        notes
      );

      // Create Zoom meeting
      let zoomMeetingId: string | undefined;
      try {
        const zoomMeeting = await ZoomApiService.createMeeting({
          topic: approvedAppointment.title,
          type: 2, // Scheduled meeting
          startTime: approvedAppointment.startTime.toISOString(),
          duration: Math.round(
            (approvedAppointment.endTime.getTime() - approvedAppointment.startTime.getTime()) /
              (1000 * 60)
          ),
          timezone: approvedAppointment.timezone,
          agenda: approvedAppointment.description || undefined,
          settings: {
            hostVideo: true,
            participantVideo: true,
            joinBeforeHost: false,
            muteUponEntry: false,
            waitingRoom: true,
            autoRecording: 'none',
          },
        });

        if (zoomMeeting) {
          zoomMeetingId = zoomMeeting.id;
          await this.appointmentRepository.updateZoomMeeting(
            approvedAppointment.id,
            zoomMeeting.id,
            zoomMeeting.joinUrl,
            zoomMeeting.startUrl,
            zoomMeeting.password || undefined
          );
        }
      } catch (zoomError) {
        logger.warn('Failed to create Zoom meeting for approved appointment:', {
          appointmentId: approvedAppointment.id,
          error: zoomError instanceof Error ? zoomError.message : 'Unknown error',
        });
        // Continue without Zoom meeting - appointment is still approved
      }

      // Send notification to company user if service is available
      if (this.notificationService) {
        try {
          // Get consultant name if userRepository is available
          let consultantName = 'Danışman';
          if (this.userRepository) {
            const consultantResult = await this.userRepository.findById(
              approvedAppointment.consultantId
            );
            if (consultantResult.isSuccess && consultantResult.value) {
              consultantName = consultantResult.value.fullName || consultantName;
            }
          }

          // Send notification to company user (requestedBy)
          await this.notificationService.sendAppointmentConfirmed(
            approvedAppointment.requestedBy,
            approvedAppointment.id,
            consultantName,
            approvedAppointment.startTime
          );
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send appointment confirmed notification', {
            error,
            appointmentId: approvedAppointment.id,
          });
        }
      }

      logger.info('Appointment approved successfully', {
        appointmentId: approvedAppointment.id,
        approvedBy,
        zoomMeetingId,
      });

      return Result.ok({
        id: approvedAppointment.id,
        zoomMeetingId,
      });
    } catch (error) {
      logger.error('Error approving appointment:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to approve appointment', 500)
      );
    }
  }
}
