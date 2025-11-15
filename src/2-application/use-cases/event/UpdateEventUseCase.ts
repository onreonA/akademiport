import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { UpdateEventDto } from '@/3-domain/entities/Event';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ZoomApiService } from '@/infrastructure/external/zoom-api.service';
import { logger } from '@/shared/utils/logger';

export class UpdateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

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

      return Result.ok(updatedEvent);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update event', 500)
      );
    }
  }
}
