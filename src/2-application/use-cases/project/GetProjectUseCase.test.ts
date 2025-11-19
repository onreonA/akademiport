/**
 * Unit Tests for GetProjectUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetProjectUseCase } from './GetProjectUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/3-domain/entities/Project';

describe('GetProjectUseCase', () => {
  let mockProjectRepository: IProjectRepository;
  let useCase: GetProjectUseCase;

  beforeEach(() => {
    mockProjectRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findTemplates: vi.fn(),
      updateProgress: vi.fn(),
      findByCompanyId: vi.fn(),
      findByConsultantId: vi.fn(),
      findByTemplateId: vi.fn(),
      restore: vi.fn(),
      findDeleted: vi.fn(),
      exists: vi.fn(),
    };

    useCase = new GetProjectUseCase(mockProjectRepository);
  });

  const createMockProject = (overrides?: Partial<Project>): Project => {
    return {
      id: 'project-1',
      companyId: 'company-1',
      consultantId: 'consultant-1',
      programId: 'program-1',
      name: 'Test Project',
      description: 'Test Description',
      status: 'planning',
      priority: 'high',
      progress: 0,
      isTemplate: false,
      templateId: null,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should get project successfully', async () => {
    const projectId = 'project-1';
    const mockProject = createMockProject({ id: projectId });

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(mockProject);

    const result = await useCase.execute(projectId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockProject);
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
  });

  it('should return error when project ID is empty', async () => {
    vi.mocked(mockProjectRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Project not found');
    expect(result.error?.statusCode).toBe(404);
  });

  it('should return error when project not found', async () => {
    const projectId = 'non-existent';

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(projectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Project not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
  });

  it('should handle repository errors', async () => {
    const projectId = 'project-1';
    const errorMessage = 'Database error';

    vi.mocked(mockProjectRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(projectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
