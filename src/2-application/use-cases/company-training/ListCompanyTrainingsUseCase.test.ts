/**
 * Unit Tests for ListCompanyTrainingsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListCompanyTrainingsUseCase } from './ListCompanyTrainingsUseCase';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock repositories
const mockCompanyTrainingRepository = {
  findByCompanyId: vi.fn(),
};

const mockCompanyRepository = {
  findById: vi.fn(),
};

const mockTrainingRepository = {
  findByProgramId: vi.fn(),
  findById: vi.fn(),
};

const mockTrainingVideoRepository = {
  findByTrainingId: vi.fn(),
};

const mockTrainingDocumentRepository = {
  findByTrainingId: vi.fn(),
};

describe('ListCompanyTrainingsUseCase', () => {
  let useCase: ListCompanyTrainingsUseCase;

  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new ListCompanyTrainingsUseCase(
      mockCompanyTrainingRepository as any,
      mockCompanyRepository as any,
      mockTrainingRepository as any,
      mockTrainingVideoRepository as any,
      mockTrainingDocumentRepository as any
    );
  });

  describe('execute', () => {
    const companyId = 'company-1';

    it('should return company trainings successfully', async () => {
      mockCompanyRepository.findById.mockResolvedValue(
        Result.ok({
          id: 'company-1',
          name: 'Company 1',
          programId: 'program-1',
        })
      );

      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([
        {
          id: 'ct-1',
          companyId: 'company-1',
          trainingId: 'training-1',
          status: 'assigned',
          assignedBy: 'user-1',
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockTrainingRepository.findById.mockResolvedValue({
        id: 'training-1',
        name: 'Training 1',
        status: 'active',
        isGlobal: false,
        programId: 'program-1',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockTrainingRepository.findByProgramId.mockResolvedValue([
        {
          id: 'training-2',
          name: 'Training 2',
          status: 'active',
          isGlobal: false,
          programId: 'program-1',
        },
      ]);

      mockTrainingVideoRepository.findByTrainingId.mockResolvedValue([{ id: 'video-1' }]);
      mockTrainingDocumentRepository.findByTrainingId.mockResolvedValue([{ id: 'doc-1' }]);

      const result = await useCase.execute(companyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0]).toHaveProperty('training');
        expect(result.value[0]).toHaveProperty('videosCount');
        expect(result.value[0]).toHaveProperty('documentsCount');
      }
    });

    it('should return error when company not found', async () => {
      mockCompanyRepository.findById.mockResolvedValue(Result.fail('Company not found'));

      const result = await useCase.execute(companyId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect((result.error as AppError).statusCode).toBe(404);
      }
    });

    it('should include program trainings when company has program', async () => {
      mockCompanyRepository.findById.mockResolvedValue(
        Result.ok({
          id: 'company-1',
          name: 'Company 1',
          programId: 'program-1',
        })
      );

      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([]);
      mockTrainingRepository.findByProgramId.mockResolvedValue([
        {
          id: 'training-1',
          name: 'Training 1',
          status: 'active',
          isGlobal: false,
          programId: 'program-1',
          createdBy: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockTrainingVideoRepository.findByTrainingId.mockResolvedValue([]);
      mockTrainingDocumentRepository.findByTrainingId.mockResolvedValue([]);

      const result = await useCase.execute(companyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0].trainingId).toBe('training-1');
      }
    });

    it('should exclude global trainings from program trainings', async () => {
      mockCompanyRepository.findById.mockResolvedValue(
        Result.ok({
          id: 'company-1',
          name: 'Company 1',
          programId: 'program-1',
        })
      );

      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([]);
      mockTrainingRepository.findByProgramId.mockResolvedValue([
        {
          id: 'training-1',
          name: 'Training 1',
          status: 'active',
          isGlobal: true, // Global training - should be excluded
          programId: 'program-1',
        },
        {
          id: 'training-2',
          name: 'Training 2',
          status: 'active',
          isGlobal: false, // Program-specific - should be included
          programId: 'program-1',
        },
      ]);

      mockTrainingVideoRepository.findByTrainingId.mockResolvedValue([]);
      mockTrainingDocumentRepository.findByTrainingId.mockResolvedValue([]);

      const result = await useCase.execute(companyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        // Should only include non-global trainings
        const trainingIds = result.value.map((ct) => ct.trainingId);
        expect(trainingIds).not.toContain('training-1');
        expect(trainingIds).toContain('training-2');
      }
    });

    it('should handle company without program', async () => {
      mockCompanyRepository.findById.mockResolvedValue(
        Result.ok({
          id: 'company-1',
          name: 'Company 1',
          programId: null,
        })
      );

      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([
        {
          id: 'ct-1',
          companyId: 'company-1',
          trainingId: 'training-1',
          status: 'assigned',
          assignedBy: 'user-1',
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockTrainingRepository.findById.mockResolvedValue({
        id: 'training-1',
        name: 'Training 1',
      });

      mockTrainingVideoRepository.findByTrainingId.mockResolvedValue([]);
      mockTrainingDocumentRepository.findByTrainingId.mockResolvedValue([]);

      const result = await useCase.execute(companyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].trainingId).toBe('training-1');
      }
    });

    it('should handle errors and return failure result', async () => {
      mockCompanyRepository.findById.mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(companyId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect((result.error as AppError).statusCode).toBe(500);
      }
    });
  });
});

