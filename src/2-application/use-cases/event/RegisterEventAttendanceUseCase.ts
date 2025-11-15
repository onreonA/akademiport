import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { EventEntity } from '@/3-domain/entities/Event';

export class RegisterEventAttendanceUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(
    eventId: string,
    userId: string,
    companyId: string,
    notes?: string
  ): Promise<Result<any>> {
    try {
      if (!eventId || eventId.trim().length === 0) {
        return Result.fail(new AppError('Event ID is required', 400));
      }

      if (!userId || userId.trim().length === 0) {
        return Result.fail(new AppError('User ID is required', 400));
      }

      if (!companyId || companyId.trim().length === 0) {
        return Result.fail(new AppError('Company ID is required', 400));
      }

      // Check if event exists
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        return Result.fail(new AppError('Event not found', 404));
      }

      // Check if event allows registration
      const eventEntity = new EventEntity(event);
      if (!eventEntity.canRegister()) {
        return Result.fail(new AppError('Event registration is not available', 400));
      }

      // Check if user already registered
      const attendees = await this.eventRepository.getAttendees(eventId);
      const alreadyRegistered = attendees.some((a) => a.userId === userId);
      if (alreadyRegistered) {
        return Result.fail(new AppError('User is already registered for this event', 400));
      }

      // Register attendance
      const attendance = await this.eventRepository.registerAttendance(
        eventId,
        userId,
        companyId,
        notes
      );

      return Result.ok(attendance);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to register attendance', 500)
      );
    }
  }
}
