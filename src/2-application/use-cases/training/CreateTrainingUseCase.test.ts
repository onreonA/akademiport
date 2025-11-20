/**
 * Unit Tests for CreateTrainingUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTrainingUseCase } from './CreateTrainingUseCase';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { Training, CreateTrainingDto } from '@/3-domain/entities/Training';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('CreateTrainingUseCase', () => {
  let mockRepository: ITrainingRepository;
  let useCase: CreateTrainingUseCase;

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

    useCase = new CreateTrainingUseCase(mockRepository);
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

  const createValidDto = (overrides?: Partial<CreateTrainingDto>): CreateTrainingDto => {
    return {
      name: 'Test Training',
      description: 'Test Description',
      programId: 'program-1',
      consultantId: 'consultant-1',
      isGlobal: false,
      status: 'draft',
      priority: 'medium',
      isLocked: false,
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should create training successfully with program ID', async () => {
      const dto = createValidDto();
      const mockTraining = createMockTraining();
      const userId = 'user-1';

      vi.mocked(mockRepository.create).mockResolvedValue(mockTraining);

      const result = await useCase.execute(dto, userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(mockTraining.id);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        consultantId: dto.consultantId || userId,
      });
    });

    it('should create global training successfully without program ID', async () => {
      const dto = createValidDto({
        isGlobal: true,
        programId: null,
      });
      const mockTraining = createMockTraining({
        isGlobal: true,
        programId: null,
      });
      const userId = 'user-1';

      vi.mocked(mockRepository.create).mockResolvedValue(mockTraining);

      const result = await useCase.execute(dto, userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(mockTraining.id);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        consultantId: dto.consultantId || userId,
      });
    });

    it('should use userId as consultantId when consultantId is not provided', async () => {
      const dto = createValidDto({
        consultantId: undefined,
      });
      const mockTraining = createMockTraining({
        consultantId: 'user-1',
      });
      const userId = 'user-1';

      vi.mocked(mockRepository.create).mockResolvedValue(mockTraining);

      const result = await useCase.execute(dto, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        consultantId: userId,
      });
    });

    it('should return error when training name is empty', async () => {
      const dto = createValidDto({
        name: '',
      });
      const userId = 'user-1';

      const result = await useCase.execute(dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Training name is required');
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when training name is only whitespace', async () => {
      const dto = createValidDto({
        name: '   ',
      });
      const userId = 'user-1';

      const result = await useCase.execute(dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Training name is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when training name exceeds 255 characters', async () => {
      const dto = createValidDto({
        name: 'a'.repeat(256),
      });
      const userId = 'user-1';

      const result = await useCase.execute(dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain(
        'Training name must be less than 255 characters'
      );
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when global training has program ID', async () => {
      const dto = createValidDto({
        isGlobal: true,
        programId: 'program-1',
      });
      const userId = 'user-1';

      const result = await useCase.execute(dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain(
        'Global training cannot have a program ID'
      );
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when program-based training does not have program ID', async () => {
      const dto = createValidDto({
        isGlobal: false,
        programId: null,
      });
      const userId = 'user-1';

      const result = await useCase.execute(dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain(
        'Program-based training must have a program ID'
      );
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const dto = createValidDto();
      const userId = 'user-1';
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.create).mockRejectedValue(repositoryError);

      const result = await useCase.execute(dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
    });

    it('should create training with optional fields', async () => {
      const dto: CreateTrainingDto = {
        name: 'Minimal Training',
        programId: 'program-1',
        isGlobal: false,
      };
      const mockTraining = createMockTraining({
        name: 'Minimal Training',
        description: null,
        status: 'draft',
        priority: 'medium',
        isLocked: false,
      });
      const userId = 'user-1';

      vi.mocked(mockRepository.create).mockResolvedValue(mockTraining);

      const result = await useCase.execute(dto, userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(mockTraining.id);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should create training with all fields provided', async () => {
      const dto = createValidDto({
        name: 'Complete Training',
        description: 'Complete Description',
        programId: 'program-1',
        consultantId: 'consultant-1',
        isGlobal: false,
        status: 'active',
        priority: 'high',
        isLocked: true,
      });
      const mockTraining = createMockTraining({
        name: 'Complete Training',
        description: 'Complete Description',
        status: 'active',
        priority: 'high',
        isLocked: true,
      });
      const userId = 'user-1';

      vi.mocked(mockRepository.create).mockResolvedValue(mockTraining);

      const result = await useCase.execute(dto, userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(mockTraining.id);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        consultantId: 'consultant-1',
      });
    });
  });
});
