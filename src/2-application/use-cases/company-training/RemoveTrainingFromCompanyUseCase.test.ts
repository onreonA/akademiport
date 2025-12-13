/**
 * Unit Tests for RemoveTrainingFromCompanyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RemoveTrainingFromCompanyUseCase } from './RemoveTrainingFromCompanyUseCase';
import { AppError } from '@/6-core/errors/AppError';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock repository
const mockCompanyTrainingRepository = {
  findByCompanyAndTraining: vi.fn(),
  deleteByCompanyAndTraining: vi.fn(),
};

describe('RemoveTrainingFromCompanyUseCase', () => {
  let useCase: RemoveTrainingFromCompanyUseCase;

  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new RemoveTrainingFromCompanyUseCase(mockCompanyTrainingRepository as any);
  });

  describe('execute', () => {
    const companyId = 'company-1';
    const trainingId = 'training-1';

    it('should remove training from company successfully', async () => {
      mockCompanyTrainingRepository.findByCompanyAndTraining.mockResolvedValue({
        id: 'ct-1',
        companyId: 'company-1',
        trainingId: 'training-1',
      });
      mockCompanyTrainingRepository.deleteByCompanyAndTraining.mockResolvedValue(undefined);

      const result = await useCase.execute(companyId, trainingId);

      expect(result.isSuccess).toBe(true);
      expect(mockCompanyTrainingRepository.deleteByCompanyAndTraining).toHaveBeenCalledWith(
        companyId,
        trainingId
      );
    });

    it('should return error when assignment not found', async () => {
      mockCompanyTrainingRepository.findByCompanyAndTraining.mockResolvedValue(null);

      const result = await useCase.execute(companyId, trainingId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect((result.error as AppError).statusCode).toBe(404);
        expect((result.error as AppError).message).toContain('Training assignment not found');
      }
      expect(mockCompanyTrainingRepository.deleteByCompanyAndTraining).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      mockCompanyTrainingRepository.findByCompanyAndTraining.mockRejectedValue(
        new Error('Database error')
      );

      const result = await useCase.execute(companyId, trainingId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect((result.error as AppError).statusCode).toBe(500);
      }
    });
  });
});

