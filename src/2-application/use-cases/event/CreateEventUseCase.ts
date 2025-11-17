import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { CreateEventDto } from '@/3-domain/entities/Event';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ZoomApiService } from '@/infrastructure/external/zoom-api.service';
import { EventEntity } from '@/3-domain/entities/Event';
import { logger } from '@/shared/utils/logger';
import { NotificationService } from '@/5-shared/services/notification';

export class CreateEventUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private notificationService?: NotificationService
  ) {}

  async execute(
    data: CreateEventDto,
    userId: string,
    createZoomMeeting: boolean = true
  ): Promise<Result<{ id: string; zoomMeetingId?: string }>> {
    try {
      // Validation
      const validationErrors = EventEntity.validate(data);
      if (validationErrors.length > 0) {
        return Result.fail(new AppError(validationErrors.join(', '), 400));
      }

      // Create event
      const createData = {
        ...data,
        createdBy: userId,
      };

      const event = await this.eventRepository.create(createData);

      // Create Zoom meeting if requested
      let zoomMeetingId: string | undefined;
      if (createZoomMeeting && data.createZoomMeeting !== false) {
        try {
          const zoomMeeting = await ZoomApiService.createMeeting({
            topic: event.title,
            type: 2, // Scheduled meeting
            startTime: event.startTime.toISOString(),
            duration: Math.round(
              (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
            ),
            timezone: event.timezone,
            password: event.zoomPassword || undefined,
            agenda: event.description || undefined,
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
            await this.eventRepository.updateZoomMeeting(
              event.id,
              zoomMeeting.id,
              zoomMeeting.joinUrl,
              zoomMeeting.startUrl,
              zoomMeeting.password || undefined
            );
          }
        } catch (zoomError) {
          logger.warn('Failed to create Zoom meeting, continuing without Zoom:', {
            eventId: event.id,
            error: zoomError instanceof Error ? zoomError.message : 'Unknown error',
          });
          // Continue without Zoom meeting - event is still created
          // Note: In production, you might want to notify the user about this
        }
      }

      // Send notification to creator if service is available
      if (this.notificationService) {
        try {
          await this.notificationService.sendEventCreated(userId, event.id, event.title);
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send event created notification', { error, eventId: event.id });
        }
      }

      return Result.ok({
        id: event.id,
        zoomMeetingId,
      });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to create event', 500)
      );
    }
  }
}
