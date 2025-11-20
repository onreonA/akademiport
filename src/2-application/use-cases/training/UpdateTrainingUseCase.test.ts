/**
 * Unit Tests for UpdateTrainingUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateTrainingUseCase } from './UpdateTrainingUseCase';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { Training, UpdateTrainingDto } from '@/3-domain/entities/Training';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('UpdateTrainingUseCase', () => {
  let mockRepository: ITrainingRepository;
  let useCase: UpdateTrainingUseCase;

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

    useCase = new UpdateTrainingUseCase(mockRepository);
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

  const createUpdateDto = (overrides?: Partial<UpdateTrainingDto>): UpdateTrainingDto => {
    return {
      name: 'Updated Training',
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should update training successfully', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({ id: trainingId });
      const updateDto = createUpdateDto();
      const updatedTraining = createMockTraining({
        id: trainingId,
        name: 'Updated Training',
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedTraining);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(trainingId);
      expect(mockRepository.findById).toHaveBeenCalledWith(trainingId);
      expect(mockRepository.update).toHaveBeenCalledWith(trainingId, updateDto);
    });

    it('should return error when training is not found', async () => {
      const trainingId = 'non-existent-training';
      const updateDto = createUpdateDto();

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Training not found');
      expect((result.error as AppError).statusCode).toBe(404);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when training name is empty', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({ id: trainingId });
      const updateDto = createUpdateDto({ name: '' });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Training name cannot be empty');
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when training name is only whitespace', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({ id: trainingId });
      const updateDto = createUpdateDto({ name: '   ' });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Training name cannot be empty');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when training name exceeds 255 characters', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({ id: trainingId });
      const updateDto = createUpdateDto({ name: 'a'.repeat(256) });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain(
        'Training name must be less than 255 characters'
      );
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when global training gets program ID', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({
        id: trainingId,
        isGlobal: true,
        programId: null,
      });
      const updateDto = createUpdateDto({ programId: 'program-1' });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain(
        'Global training cannot have a program ID'
      );
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when program-based training loses program ID', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({
        id: trainingId,
        isGlobal: false,
        programId: 'program-1',
      });
      const updateDto = createUpdateDto({ programId: null });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain(
        'Program-based training must have a program ID'
      );
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update training with partial data', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({ id: trainingId });
      const updateDto: UpdateTrainingDto = {
        description: 'Updated Description',
      };
      const updatedTraining = createMockTraining({
        id: trainingId,
        description: 'Updated Description',
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedTraining);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(trainingId);
      expect(mockRepository.update).toHaveBeenCalledWith(trainingId, updateDto);
    });

    it('should update training status and priority', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({
        id: trainingId,
        status: 'draft',
        priority: 'medium',
      });
      const updateDto: UpdateTrainingDto = {
        status: 'active',
        priority: 'high',
      };
      const updatedTraining = createMockTraining({
        id: trainingId,
        status: 'active',
        priority: 'high',
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedTraining);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(trainingId, updateDto);
    });

    it('should handle repository errors', async () => {
      const trainingId = 'training-1';
      const existingTraining = createMockTraining({ id: trainingId });
      const updateDto = createUpdateDto();
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTraining);
      vi.mocked(mockRepository.update).mockRejectedValue(repositoryError);

      const result = await useCase.execute(trainingId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
    });
  });
});
