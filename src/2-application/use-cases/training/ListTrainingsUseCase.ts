import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { Training, TrainingFilterDto } from '@/domain/entities/Training';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class ListTrainingsUseCase {
  constructor(private trainingRepository: ITrainingRepository) {}

  async execute(
    filters?: TrainingFilterDto,
    useAdminClient = false
  ): Promise<Result<{ data: Training[]; total: number }>> {
    try {
      // Type assertion to access internal method - temporary solution
      const repository = this.trainingRepository as any;
      const result = useAdminClient
        ? await repository.findAll(filters, true)
        : await repository.findAll(filters);

      return Result.ok(result);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list trainings', 500)
      );
    }
  }
}
