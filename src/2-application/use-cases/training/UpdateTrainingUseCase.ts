import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { UpdateTrainingDto } from '@/domain/entities/Training';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class UpdateTrainingUseCase {
  constructor(private trainingRepository: ITrainingRepository) {}

  async execute(id: string, data: UpdateTrainingDto): Promise<Result<{ id: string }>> {
    try {
      // Check if training exists
      const existing = await this.trainingRepository.findById(id);
      if (!existing) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Validation
      if (data.name !== undefined && data.name.trim().length === 0) {
        return Result.fail(new AppError('Training name cannot be empty', 400));
      }

      if (data.name && data.name.length > 255) {
        return Result.fail(new AppError('Training name must be less than 255 characters', 400));
      }

      // Global vs Program check
      const isGlobal = data.isGlobal !== undefined ? data.isGlobal : existing.isGlobal;
      const programId = data.programId !== undefined ? data.programId : existing.programId;

      if (isGlobal && programId) {
        return Result.fail(new AppError('Global training cannot have a program ID', 400));
      }

      if (!isGlobal && !programId) {
        return Result.fail(new AppError('Program-based training must have a program ID', 400));
      }

      // Update training
      const training = await this.trainingRepository.update(id, data);

      return Result.ok({ id: training.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update training', 500)
      );
    }
  }
}
