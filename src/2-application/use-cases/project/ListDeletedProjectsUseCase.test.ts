/**
 * Unit Tests for ListDeletedProjectsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListDeletedProjectsUseCase } from './ListDeletedProjectsUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Result } from '@/6-core/result/Result';
import type { Project } from '@/3-domain/entities/Project';

describe('ListDeletedProjectsUseCase', () => {
  let mockRepository: IProjectRepository;
  let useCase: ListDeletedProjectsUseCase;

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

    useCase = new ListDeletedProjectsUseCase(mockRepository);
  });

  const createMockDeletedProject = (overrides?: Partial<Project>): Project => {
    return {
      id: 'project-1',
      companyId: 'company-1',
      consultantId: 'consultant-1',
      programId: 'program-1',
      name: 'Deleted Project',
      description: 'Project description',
      status: 'cancelled',
      priority: 'medium',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      progress: 0,
      isTemplate: false,
      templateId: null,
      deletedAt: new Date('2025-01-15'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should list deleted projects successfully', async () => {
      const mockDeletedProjects = [
        createMockDeletedProject({ id: 'project-1' }),
        createMockDeletedProject({ id: 'project-2' }),
      ];

      vi.mocked(mockRepository.findDeleted).mockResolvedValue(mockDeletedProjects);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockDeletedProjects);
      expect(mockRepository.findDeleted).toHaveBeenCalled();
    });

    it('should return empty array when no deleted projects found', async () => {
      vi.mocked(mockRepository.findDeleted).mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockRepository.findDeleted).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
