import { IAppointmentRepository } from '@/domain/interfaces/repositories/IAppointmentRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { ZoomApiService } from '@/infrastructure/external/zoom-api.service';
import { logger } from '@/shared/utils/logger';

export class ApproveAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

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
