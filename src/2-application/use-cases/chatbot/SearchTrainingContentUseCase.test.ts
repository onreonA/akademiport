/**
 * SearchTrainingContentUseCase Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchTrainingContentUseCase } from './SearchTrainingContentUseCase';
import { Result } from '@/6-core/result/Result';
import { Training } from '@/3-domain/entities/Training';

// Mock repositories
const mockFindAll = vi.fn();
const mockTrainingRepository = {
  findAll: mockFindAll,
  findById: vi.fn(),
  findByProgramId: vi.fn(),
  findByConsultantId: vi.fn(),
  findGlobal: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockTrainingDocumentRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByTrainingId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteByTrainingId: vi.fn(),
};

const mockTrainingVideoRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByTrainingId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteByTrainingId: vi.fn(),
};

describe('SearchTrainingContentUseCase', () => {
  let useCase: SearchTrainingContentUseCase;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new SearchTrainingContentUseCase(
      mockTrainingRepository as any,
      mockTrainingDocumentRepository as any,
      mockTrainingVideoRepository as any
    );
  });

  describe('execute', () => {
    const mockTrainings: Training[] = [
      {
        id: 'training-1',
        name: 'E-İhracat Temelleri',
        description: 'E-ihracat hakkında temel bilgiler',
        programId: 'program-1',
        consultantId: null,
        isGlobal: false,
        status: 'active',
        priority: 'high',
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
      },
      {
        id: 'training-2',
        name: 'Pazarlama Stratejileri',
        description: 'Dijital pazarlama stratejileri',
        programId: 'program-1',
        consultantId: null,
        isGlobal: false,
        status: 'active',
        priority: 'medium',
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
      },
    ];

    it('should return empty array when query is empty', async () => {
      const result = await useCase.execute({
        query: '',
        programId: 'program-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual([]);
      }
      expect(mockFindAll).not.toHaveBeenCalled();
    });

    it('should search and return relevant trainings', async () => {
      mockFindAll.mockResolvedValue({
        data: mockTrainings,
        total: 2,
      });

      const result = await useCase.execute({
        query: 'e-ihracat',
        programId: 'program-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeGreaterThan(0);
        // Check that the training name contains relevant keywords (case-insensitive)
        const trainingName = result.value[0].training.name.toLowerCase();
        expect(trainingName.includes('e-ihracat') || trainingName.includes('e-i̇hracat')).toBe(true);
        expect(result.value[0].relevanceScore).toBeGreaterThan(0);
      }

      expect(mockFindAll).toHaveBeenCalledWith({
        programId: 'program-1',
        status: 'active',
        limit: 1000,
      });
    });

    it('should return empty array when no trainings found', async () => {
      mockFindAll.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await useCase.execute({
        query: 'nonexistent',
        programId: 'program-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual([]);
      }
    });

    it('should sort results by relevance score', async () => {
      mockFindAll.mockResolvedValue({
        data: mockTrainings,
        total: 2,
      });

      const result = await useCase.execute({
        query: 'e-ihracat',
        programId: 'program-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess && result.value.length > 1) {
        expect(result.value[0].relevanceScore).toBeGreaterThanOrEqual(
          result.value[1].relevanceScore
        );
      }
    });

    it('should limit results when limit is provided', async () => {
      mockFindAll.mockResolvedValue({
        data: mockTrainings,
        total: 2,
      });

      const result = await useCase.execute({
        query: 'e-ihracat',
        programId: 'program-1',
        limit: 1,
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeLessThanOrEqual(1);
      }
    });

    it('should handle errors gracefully', async () => {
      mockFindAll.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute({
        query: 'test',
        programId: 'program-1',
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
