import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class GetEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(eventId: string): Promise<Result<any>> {
    try {
      if (!eventId || eventId.trim().length === 0) {
        return Result.fail(new AppError('Event ID is required', 400));
      }

      const event = await this.eventRepository.findById(eventId);

      if (!event) {
        return Result.fail(new AppError('Event not found', 404));
      }

      return Result.ok(event);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to get event', 500)
      );
    }
  }
}
