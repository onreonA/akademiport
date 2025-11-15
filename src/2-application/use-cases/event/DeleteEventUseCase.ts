import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ZoomApiService } from '@/infrastructure/external/zoom-api.service';
import { logger } from '@/shared/utils/logger';

export class DeleteEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(eventId: string, deleteZoomMeeting: boolean = true): Promise<Result<void>> {
    try {
      if (!eventId || eventId.trim().length === 0) {
        return Result.fail(new AppError('Event ID is required', 400));
      }

      // Check if event exists
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        return Result.fail(new AppError('Event not found', 404));
      }

      // Delete Zoom meeting if exists
      if (deleteZoomMeeting && event.zoomMeetingId) {
        try {
          await ZoomApiService.deleteMeeting(event.zoomMeetingId);
        } catch (zoomError) {
          logger.warn('Failed to delete Zoom meeting, continuing with event deletion:', {
            eventId,
            zoomMeetingId: event.zoomMeetingId,
            error: zoomError instanceof Error ? zoomError.message : 'Unknown error',
          });
          // Continue - event will still be deleted
        }
      }

      // Delete event (soft delete)
      await this.eventRepository.delete(eventId);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete event', 500)
      );
    }
  }
}
