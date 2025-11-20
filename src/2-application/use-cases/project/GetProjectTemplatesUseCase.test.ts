/**
 * Unit Tests for GetProjectTemplatesUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetProjectTemplatesUseCase } from './GetProjectTemplatesUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Result } from '@/6-core/result/Result';
import type { Project } from '@/3-domain/entities/Project';

describe('GetProjectTemplatesUseCase', () => {
  let mockRepository: IProjectRepository;
  let useCase: GetProjectTemplatesUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findTemplates: vi.fn(),
      updateProgress: vi.fn(),
      exists: vi.fn(),
      findDeleted: vi.fn(),
    } as any;

    useCase = new GetProjectTemplatesUseCase(mockRepository);
  });

  const createMockTemplate = (overrides?: Partial<Project>): Project => {
    return {
      id: 'template-1',
      companyId: null,
      consultantId: 'consultant-1',
      programId: 'program-1',
      name: 'Template Project',
      description: 'Template description',
      status: 'todo',
      priority: 'medium',
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: true,
      templateId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should get templates successfully', async () => {
      const mockTemplates = [
        createMockTemplate({ id: 'template-1' }),
        createMockTemplate({ id: 'template-2' }),
      ];

      vi.mocked(mockRepository.findTemplates).mockResolvedValue(mockTemplates);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockTemplates);
      expect(mockRepository.findTemplates).toHaveBeenCalled();
    });

    it('should return empty array when no templates found', async () => {
      vi.mocked(mockRepository.findTemplates).mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockRepository.findTemplates).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
