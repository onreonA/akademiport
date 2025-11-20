/**
 * Unit Tests for DeleteTrainingUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteTrainingUseCase } from './DeleteTrainingUseCase';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { Training } from '@/3-domain/entities/Training';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('DeleteTrainingUseCase', () => {
  let mockRepository: ITrainingRepository;
  let useCase: DeleteTrainingUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByProgramId: vi.fn(),
      findByConsultantId: vi.fn(),
      findGlobal: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    useCase = new DeleteTrainingUseCase(mockRepository);
  });

  const createMockTraining = (overrides?: Partial<Training>): Training => {
    return {
      id: 'training-1',
      name: 'Test Training',
      description: 'Test Description',
      programId: 'program-1',
      consultantId: 'consultant-1',
      isGlobal: false,
      status: 'draft',
      priority: 'medium',
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should delete training successfully', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({ id: trainingId });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      const result = await useCase.execute(trainingId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeUndefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(trainingId);
      expect(mockRepository.delete).toHaveBeenCalledWith(trainingId);
    });

    it('should return error when training is not found', async () => {
      const trainingId = 'non-existent-training';

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(trainingId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Training not found');
      expect((result.error as AppError).statusCode).toBe(404);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during findById', async () => {
      const trainingId = 'training-1';
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.findById).mockRejectedValue(repositoryError);

      const result = await useCase.execute(trainingId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during delete', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({ id: trainingId });
      const repositoryError = new Error('Delete failed');

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);
      vi.mocked(mockRepository.delete).mockRejectedValue(repositoryError);

      const result = await useCase.execute(trainingId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Delete failed');
      expect((result.error as AppError).statusCode).toBe(500);
    });

    it('should delete global training successfully', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({
        id: trainingId,
        isGlobal: true,
        programId: null,
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      const result = await useCase.execute(trainingId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(trainingId);
    });

    it('should delete program-based training successfully', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({
        id: trainingId,
        isGlobal: false,
        programId: 'program-1',
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      const result = await useCase.execute(trainingId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(trainingId);
    });
  });
});
