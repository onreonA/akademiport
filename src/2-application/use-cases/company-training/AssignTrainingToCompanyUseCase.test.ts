/**
 * Unit Tests for AssignTrainingToCompanyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignTrainingToCompanyUseCase } from './AssignTrainingToCompanyUseCase';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock repositories
const mockCompanyTrainingRepository = {
  findByCompanyAndTraining: vi.fn(),
  create: vi.fn(),
};

const mockCompanyRepository = {
  findById: vi.fn(),
};

const mockTrainingRepository = {
  findById: vi.fn(),
};

describe('AssignTrainingToCompanyUseCase', () => {
  let useCase: AssignTrainingToCompanyUseCase;

  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new AssignTrainingToCompanyUseCase(
      mockCompanyTrainingRepository as any,
      mockCompanyRepository as any,
      mockTrainingRepository as any
    );
  });

  describe('execute', () => {
    const dto = {
      companyId: 'company-1',
      trainingId: 'training-1',
    };
    const assignedBy = 'user-1';

    it('should assign training to company successfully', async () => {
      mockCompanyRepository.findById.mockResolvedValue(
        Result.ok({ id: 'company-1', name: 'Company 1' })
      );
      mockTrainingRepository.findById.mockResolvedValue({
        id: 'training-1',
        name: 'Training 1',
      });
      mockCompanyTrainingRepository.findByCompanyAndTraining.mockResolvedValue(null);
      mockCompanyTrainingRepository.create.mockResolvedValue({
        id: 'ct-1',
        companyId: 'company-1',
        trainingId: 'training-1',
        status: 'assigned',
      });

      const result = await useCase.execute(dto, assignedBy);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.id).toBe('ct-1');
        expect(mockCompanyTrainingRepository.create).toHaveBeenCalledWith({
          companyId: 'company-1',
          trainingId: 'training-1',
          assignedBy: 'user-1',
          status: 'assigned',
        });
      }
    });

    it('should return error when company not found', async () => {
      mockCompanyRepository.findById.mockResolvedValue(Result.fail('Company not found'));

      const result = await useCase.execute(dto, assignedBy);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect((result.error as AppError).statusCode).toBe(404);
        expect((result.error as AppError).message).toContain('Company not found');
      }
    });

    it('should return error when training not found', async () => {
      mockCompanyRepository.findById.mockResolvedValue(
        Result.ok({ id: 'company-1', name: 'Company 1' })
      );
      mockTrainingRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(dto, assignedBy);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect((result.error as AppError).statusCode).toBe(404);
        expect((result.error as AppError).message).toContain('Training not found');
      }
    });

    it('should return error when training already assigned', async () => {
      mockCompanyRepository.findById.mockResolvedValue(
        Result.ok({ id: 'company-1', name: 'Company 1' })
      );
      mockTrainingRepository.findById.mockResolvedValue({
        id: 'training-1',
        name: 'Training 1',
      });
      mockCompanyTrainingRepository.findByCompanyAndTraining.mockResolvedValue({
        id: 'ct-1',
        companyId: 'company-1',
        trainingId: 'training-1',
      });

      const result = await useCase.execute(dto, assignedBy);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect((result.error as AppError).statusCode).toBe(400);
        expect((result.error as AppError).message).toContain('already assigned');
      }
    });

    it('should handle repository errors', async () => {
      mockCompanyRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(dto, assignedBy);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect((result.error as AppError).statusCode).toBe(500);
      }
    });
  });
});

