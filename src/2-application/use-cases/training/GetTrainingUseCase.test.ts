/**
 * Unit Tests for GetTrainingUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetTrainingUseCase } from './GetTrainingUseCase';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { Training } from '@/3-domain/entities/Training';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('GetTrainingUseCase', () => {
  let mockRepository: ITrainingRepository;
  let useCase: GetTrainingUseCase;

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

    useCase = new GetTrainingUseCase(mockRepository);
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
    it('should get training successfully', async () => {
      const trainingId = 'training-1';
      const mockTraining = createMockTraining({ id: trainingId });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockTraining);

      const result = await useCase.execute(trainingId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockTraining);
      expect(mockRepository.findById).toHaveBeenCalledWith(trainingId);
    });

    it('should return error when training is not found', async () => {
      const trainingId = 'non-existent-training';

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(trainingId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Training not found');
      expect((result.error as AppError).statusCode).toBe(404);
      expect(mockRepository.findById).toHaveBeenCalledWith(trainingId);
    });

    it('should handle repository errors', async () => {
      const trainingId = 'training-1';
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.findById).mockRejectedValue(repositoryError);

      const result = await useCase.execute(trainingId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
    });

    it('should get global training successfully', async () => {
      const trainingId = 'training-1';
      const mockTraining = createMockTraining({
        id: trainingId,
        isGlobal: true,
        programId: null,
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockTraining);

      const result = await useCase.execute(trainingId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isGlobal).toBe(true);
      expect(result.value?.programId).toBeNull();
    });

    it('should get program-based training successfully', async () => {
      const trainingId = 'training-1';
      const mockTraining = createMockTraining({
        id: trainingId,
        isGlobal: false,
        programId: 'program-1',
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockTraining);

      const result = await useCase.execute(trainingId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isGlobal).toBe(false);
      expect(result.value?.programId).toBe('program-1');
    });
  });
});
