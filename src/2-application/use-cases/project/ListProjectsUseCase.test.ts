/**
 * Unit Tests for ListProjectsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListProjectsUseCase } from './ListProjectsUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Result } from '@/6-core/result/Result';
import type { Project } from '@/3-domain/entities/Project';

describe('ListProjectsUseCase', () => {
  let mockRepository: IProjectRepository;
  let useCase: ListProjectsUseCase;

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

    useCase = new ListProjectsUseCase(mockRepository);
  });

  const createMockProject = (overrides?: Partial<Project>): Project => {
    return {
      id: 'project-1',
      companyId: 'company-1',
      consultantId: 'consultant-1',
      programId: 'program-1',
      name: 'Test Project',
      description: 'Test description',
      status: 'todo',
      priority: 'medium',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      progress: 0,
      isTemplate: false,
      templateId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should list projects successfully without filters', async () => {
      const mockProjects = [
        createMockProject({ id: 'project-1' }),
        createMockProject({ id: 'project-2' }),
      ];

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: mockProjects,
        total: 2,
      });

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toEqual(mockProjects);
      expect(result.value?.total).toBe(2);
      expect(result.value?.page).toBe(1);
      expect(result.value?.limit).toBe(10);
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should list projects with filters', async () => {
      const filters = {
        companyId: 'company-1',
        status: 'in_progress',
        page: 2,
        limit: 20,
      };
      const mockProjects = [createMockProject({ id: 'project-1', companyId: 'company-1' })];

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: mockProjects,
        total: 1,
      });

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toEqual(mockProjects);
      expect(result.value?.page).toBe(2);
      expect(result.value?.limit).toBe(20);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should filter projects by companyId', async () => {
      const filters = { companyId: 'company-2' };
      const mockProjects = [createMockProject({ id: 'project-1', companyId: 'company-2' })];

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: mockProjects,
        total: 1,
      });

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: 'company-2' })
      );
    });

    it('should filter projects by consultantId', async () => {
      const filters = { consultantId: 'consultant-2' };
      const mockProjects = [createMockProject({ id: 'project-1', consultantId: 'consultant-2' })];

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: mockProjects,
        total: 1,
      });

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ consultantId: 'consultant-2' })
      );
    });

    it('should filter projects by status', async () => {
      const filters = { status: 'done' };
      const mockProjects = [createMockProject({ id: 'project-1', status: 'done' })];

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: mockProjects,
        total: 1,
      });

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'done' })
      );
    });

    it('should filter templates', async () => {
      const filters = { isTemplate: true };
      const mockProjects = [createMockProject({ id: 'template-1', isTemplate: true })];

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: mockProjects,
        total: 1,
      });

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ isTemplate: true })
      );
    });

    it('should handle pagination', async () => {
      const filters = { page: 3, limit: 15 };
      const mockProjects = Array.from({ length: 15 }, (_, i) =>
        createMockProject({ id: `project-${i + 1}` })
      );

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: mockProjects,
        total: 50,
      });

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.page).toBe(3);
      expect(result.value?.limit).toBe(15);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty list when no projects found', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value?.data).toEqual([]);
      expect(result.value?.total).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockRepository.findAll).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
