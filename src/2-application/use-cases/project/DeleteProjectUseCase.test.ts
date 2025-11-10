/**
 * Unit Tests for DeleteProjectUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteProjectUseCase } from './DeleteProjectUseCase';
import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/domain/entities/Project';

describe('DeleteProjectUseCase', () => {
  let mockProjectRepository: IProjectRepository;
  let useCase: DeleteProjectUseCase;

  beforeEach(() => {
    mockProjectRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findTemplates: vi.fn(),
      updateProgress: vi.fn(),
      exists: vi.fn(),
    };

    useCase = new DeleteProjectUseCase(mockProjectRepository);
  });

  it('should delete a project successfully', async () => {
    const projectId = 'project-1';

    const existingProject: Project = {
      id: projectId,
      name: 'Test Project',
      consultantId: 'consultant-1',
      companyId: 'company-1',
      programId: 'program-1',
      description: null,
      status: 'active',
      priority: 'medium',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      progress: 0,
      isTemplate: false,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.exists).mockResolvedValue(true);
    vi.mocked(mockProjectRepository.delete).mockResolvedValue(undefined);

    const result = await useCase.execute(projectId);

    expect(result.isSuccess).toBe(true);
    expect(mockProjectRepository.delete).toHaveBeenCalledWith(projectId);
  });

  it('should fail when project not found', async () => {
    const projectId = 'non-existent';

    vi.mocked(mockProjectRepository.exists).mockResolvedValue(false);

    const result = await useCase.execute(projectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('not found');
    expect(mockProjectRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository error', async () => {
    const projectId = 'project-1';

    const existingProject: Project = {
      id: projectId,
      name: 'Test Project',
      consultantId: 'consultant-1',
      companyId: 'company-1',
      programId: 'program-1',
      description: null,
      status: 'active',
      priority: 'medium',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      progress: 0,
      isTemplate: false,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.exists).mockResolvedValue(true);
    vi.mocked(mockProjectRepository.delete).mockRejectedValue(new Error('Database error'));

    const result = await useCase.execute(projectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
  });
});
