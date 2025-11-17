import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { UpdateEventDto } from '@/3-domain/entities/Event';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ZoomApiService } from '@/infrastructure/external/zoom-api.service';
import { logger } from '@/shared/utils/logger';
import { NotificationService } from '@/5-shared/services/notification';

export class UpdateEventUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private notificationService?: NotificationService
  ) {}

  async execute(eventId: string, data: UpdateEventDto): Promise<Result<any>> {
    try {
      if (!eventId || eventId.trim().length === 0) {
        return Result.fail(new AppError('Event ID is required', 400));
      }

      // Check if event exists
      const existingEvent = await this.eventRepository.findById(eventId);
      if (!existingEvent) {
        return Result.fail(new AppError('Event not found', 404));
      }

      // Update event
      const updatedEvent = await this.eventRepository.update(eventId, data);

      // Automatically update Zoom meeting if meeting exists and relevant fields changed
      if (existingEvent.zoomMeetingId) {
        const shouldUpdateZoom =
          data.title !== undefined ||
          data.description !== undefined ||
          data.startTime !== undefined ||
          data.endTime !== undefined ||
          data.timezone !== undefined;

        if (shouldUpdateZoom) {
          try {
            const zoomMeeting = await ZoomApiService.updateMeeting(existingEvent.zoomMeetingId, {
              topic: updatedEvent.title,
              startTime: updatedEvent.startTime.toISOString(),
              duration: Math.round(
                (updatedEvent.endTime.getTime() - updatedEvent.startTime.getTime()) / (1000 * 60)
              ),
              timezone: updatedEvent.timezone,
              agenda: updatedEvent.description || undefined,
            });

            if (zoomMeeting) {
              await this.eventRepository.updateZoomMeeting(
                updatedEvent.id,
                zoomMeeting.id,
                zoomMeeting.joinUrl,
                zoomMeeting.startUrl,
                zoomMeeting.password || undefined
              );
              logger.info(`Zoom meeting updated for event ${eventId}`);
            }
          } catch (zoomError) {
            logger.warn('Failed to update Zoom meeting, continuing without Zoom update:', {
              eventId,
              zoomMeetingId: existingEvent.zoomMeetingId,
              error: zoomError instanceof Error ? zoomError.message : 'Unknown error',
            });
            // Continue - event is still updated even if Zoom update fails
          }
        }
      }

      // Send notification to all attendees if service is available
      if (this.notificationService) {
        try {
          const attendees = await this.eventRepository.getAttendees(eventId);
          const attendeeUserIds = attendees.map((a) => a.userId);

          // Send notification to all attendees
          for (const userId of attendeeUserIds) {
            try {
              await this.notificationService.sendEventUpdated(userId, eventId, updatedEvent.title);
            } catch (error) {
              logger.error('Failed to send event updated notification to user', {
                error,
                userId,
                eventId,
              });
            }
          }
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send event updated notifications', { error, eventId });
        }
      }

      return Result.ok(updatedEvent);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update event', 500)
      );
    }
  }
}
