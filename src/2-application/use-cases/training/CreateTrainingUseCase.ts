import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { CreateTrainingDto } from '@/3-domain/entities/Training';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class CreateTrainingUseCase {
  constructor(private trainingRepository: ITrainingRepository) {}

  async execute(data: CreateTrainingDto, userId: string): Promise<Result<{ id: string }>> {
    try {
      // Validation
      if (!data.name || data.name.trim().length === 0) {
        return Result.fail(new AppError('Training name is required', 400));
      }

      if (data.name.length > 255) {
        return Result.fail(new AppError('Training name must be less than 255 characters', 400));
      }

      // Global vs Program check
      if (data.isGlobal && data.programId) {
        return Result.fail(new AppError('Global training cannot have a program ID', 400));
      }

      if (!data.isGlobal && !data.programId) {
        return Result.fail(new AppError('Program-based training must have a program ID', 400));
      }

      // Create training
      const createData = {
        ...data,
        consultantId: data.consultantId || userId, // Default to current user
      };

      const training = await this.trainingRepository.create(createData);

      return Result.ok({ id: training.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to create training', 500)
      );
    }
  }
}
