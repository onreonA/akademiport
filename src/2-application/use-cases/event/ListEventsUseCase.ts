import { IEventRepository } from '@/domain/interfaces/repositories/IEventRepository';
import { EventFilterDto } from '@/domain/entities/Event';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class ListEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(
    filters?: EventFilterDto
  ): Promise<
    Result<{ events: any[]; total: number; page: number; limit: number; totalPages: number }>
  > {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;

      const result = await this.eventRepository.findAll(filters);

      const totalPages = Math.ceil(result.total / limit);

      return Result.ok({
        events: result.data,
        total: result.total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list events', 500)
      );
    }
  }
}
