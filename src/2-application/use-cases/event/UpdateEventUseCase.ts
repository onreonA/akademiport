import { IEventRepository } from '@/domain/interfaces/repositories/IEventRepository';
import { UpdateEventDto } from '@/domain/entities/Event';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { ZoomApiService } from '@/infrastructure/external/zoom-api.service';
import { logger } from '@/shared/utils/logger';

export class UpdateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(
    eventId: string,
    data: UpdateEventDto,
    updateZoomMeeting: boolean = false
  ): Promise<Result<any>> {
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

      // Update Zoom meeting if requested and meeting exists
      if (updateZoomMeeting && existingEvent.zoomMeetingId) {
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
          }
        } catch (zoomError) {
          logger.warn('Failed to update Zoom meeting, continuing without Zoom update:', {
            eventId: id,
            error: zoomError instanceof Error ? zoomError.message : 'Unknown error',
          });
          // Continue - event is still updated
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
