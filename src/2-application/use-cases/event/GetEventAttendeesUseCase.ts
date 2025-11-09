import { IEventRepository } from '@/domain/interfaces/repositories/IEventRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class GetEventAttendeesUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(eventId: string): Promise<Result<any[]>> {
    try {
      if (!eventId || eventId.trim().length === 0) {
        return Result.fail(new AppError('Event ID is required', 400));
      }

      // Check if event exists
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        return Result.fail(new AppError('Event not found', 404));
      }

      // Get attendees
      const attendees = await this.eventRepository.getAttendees(eventId);

      return Result.ok(attendees);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to get attendees', 500)
      );
    }
  }
}
