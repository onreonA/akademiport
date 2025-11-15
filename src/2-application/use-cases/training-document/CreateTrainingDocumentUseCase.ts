import { ITrainingDocumentRepository } from '@/3-domain/interfaces/repositories/ITrainingDocumentRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { CreateTrainingDocumentDto } from '@/3-domain/entities/TrainingDocument';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class CreateTrainingDocumentUseCase {
  constructor(
    private trainingDocumentRepository: ITrainingDocumentRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(data: CreateTrainingDocumentDto): Promise<Result<{ id: string }>> {
    try {
      console.log('🔍 CreateTrainingDocumentUseCase:', {
        trainingId: data.trainingId,
        title: data.title,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        orderIndex: data.orderIndex,
        isLocked: data.isLocked,
      });

      // Validation
      if (!data.title || data.title.trim().length === 0) {
        return Result.fail(new AppError('Document title is required', 400));
      }

      if (!data.fileUrl || data.fileUrl.trim().length === 0) {
        return Result.fail(new AppError('File URL is required', 400));
      }

      if (!data.fileName || data.fileName.trim().length === 0) {
        return Result.fail(new AppError('File name is required', 400));
      }

      // Note: Training existence check is done implicitly by the database foreign key constraint
      // If training doesn't exist or user doesn't have access, the insert will fail with a foreign key error
      // This avoids RLS policy issues where findById might not find the training even if it exists

      // Create document
      console.log('📝 Creating document with data:', {
        trainingId: data.trainingId,
        title: data.title,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        orderIndex: data.orderIndex,
        isLocked: data.isLocked,
      });

      try {
        const document = await this.trainingDocumentRepository.create(data);
        console.log('✅ Document created successfully:', document.id);
        return Result.ok({ id: document.id });
      } catch (repoError) {
        console.error('❌ TrainingDocumentRepository.create error:', {
          error: repoError instanceof Error ? repoError.message : 'Unknown error',
          stack: repoError instanceof Error ? repoError.stack : undefined,
        });
        throw repoError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('❌ CreateTrainingDocumentUseCase.execute error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to create training document',
          500
        )
      );
    }
  }
}
