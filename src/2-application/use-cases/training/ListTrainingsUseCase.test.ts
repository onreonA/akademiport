/**
 * Unit Tests for ListTrainingsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListTrainingsUseCase } from './ListTrainingsUseCase';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { Training, TrainingFilterDto } from '@/3-domain/entities/Training';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('ListTrainingsUseCase', () => {
  let mockRepository: ITrainingRepository;
  let useCase: ListTrainingsUseCase;

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

    useCase = new ListTrainingsUseCase(mockRepository);
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

  const createMockResult = (trainings: Training[], total: number) => {
    return { data: trainings, total };
  };

  describe('execute', () => {
    it('should list trainings successfully without filters', async () => {
      const mockTrainings = [
        createMockTraining({ id: 'training-1' }),
        createMockTraining({ id: 'training-2' }),
      ];
      const mockResult = createMockResult(mockTrainings, 2);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toEqual(mockTrainings);
      expect(result.value?.total).toBe(2);
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should list trainings with filters', async () => {
      const filters: TrainingFilterDto = {
        programId: 'program-1',
        status: 'active',
        page: 1,
        limit: 10,
      };
      const mockTrainings = [
        createMockTraining({ id: 'training-1', programId: 'program-1', status: 'active' }),
      ];
      const mockResult = createMockResult(mockTrainings, 1);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toEqual(mockTrainings);
      expect(result.value?.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should list global trainings', async () => {
      const filters: TrainingFilterDto = {
        isGlobal: true,
      };
      const mockTrainings = [
        createMockTraining({ id: 'training-1', isGlobal: true, programId: null }),
        createMockTraining({ id: 'training-2', isGlobal: true, programId: null }),
      ];
      const mockResult = createMockResult(mockTrainings, 2);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toHaveLength(2);
      expect(result.value?.data.every((t) => t.isGlobal)).toBe(true);
    });

    it('should list program-based trainings', async () => {
      const filters: TrainingFilterDto = {
        programId: 'program-1',
        isGlobal: false,
      };
      const mockTrainings = [
        createMockTraining({ id: 'training-1', programId: 'program-1', isGlobal: false }),
      ];
      const mockResult = createMockResult(mockTrainings, 1);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toHaveLength(1);
      expect(result.value?.data[0].programId).toBe('program-1');
    });

    it('should list trainings with search filter', async () => {
      const filters: TrainingFilterDto = {
        search: 'test',
      };
      const mockTrainings = [createMockTraining({ id: 'training-1', name: 'Test Training' })];
      const mockResult = createMockResult(mockTrainings, 1);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should list trainings with pagination', async () => {
      const filters: TrainingFilterDto = {
        page: 2,
        limit: 5,
      };
      const mockTrainings = Array.from({ length: 5 }, (_, i) =>
        createMockTraining({ id: `training-${i + 1}` })
      );
      const mockResult = createMockResult(mockTrainings, 15);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toHaveLength(5);
      expect(result.value?.total).toBe(15);
    });

    it('should return empty list when no trainings found', async () => {
      const mockResult = createMockResult([], 0);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toEqual([]);
      expect(result.value?.total).toBe(0);
    });

    it('should use admin client when useAdminClient is true', async () => {
      const mockTrainings = [createMockTraining({ id: 'training-1' })];
      const mockResult = createMockResult(mockTrainings, 1);

      // Mock the internal findAll method with admin client flag
      const repository = mockRepository as any;
      repository.findAll = vi.fn().mockResolvedValue(mockResult);

      const result = await useCase.execute(undefined, true);

      expect(result.isSuccess).toBe(true);
      expect(repository.findAll).toHaveBeenCalledWith(undefined, true);
    });

    it('should handle repository errors', async () => {
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.findAll).mockRejectedValue(repositoryError);

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
    });

    it('should filter by consultant ID', async () => {
      const filters: TrainingFilterDto = {
        consultantId: 'consultant-1',
      };
      const mockTrainings = [
        createMockTraining({ id: 'training-1', consultantId: 'consultant-1' }),
      ];
      const mockResult = createMockResult(mockTrainings, 1);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should filter by status', async () => {
      const filters: TrainingFilterDto = {
        status: 'active',
      };
      const mockTrainings = [
        createMockTraining({ id: 'training-1', status: 'active' }),
        createMockTraining({ id: 'training-2', status: 'active' }),
      ];
      const mockResult = createMockResult(mockTrainings, 2);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data.every((t) => t.status === 'active')).toBe(true);
    });

    it('should filter by priority', async () => {
      const filters: TrainingFilterDto = {
        priority: 'high',
      };
      const mockTrainings = [createMockTraining({ id: 'training-1', priority: 'high' })];
      const mockResult = createMockResult(mockTrainings, 1);

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockResult);

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data[0].priority).toBe('high');
    });
  });
});
