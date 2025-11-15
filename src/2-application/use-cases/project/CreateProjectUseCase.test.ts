import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProjectUseCase } from './CreateProjectUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/3-domain/entities/Project';

describe('CreateProjectUseCase', () => {
  let mockRepository: IProjectRepository;
  let useCase: CreateProjectUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findTemplates: vi.fn(),
      updateProgress: vi.fn(),
    };
    useCase = new CreateProjectUseCase(mockRepository);
  });

  it('should create a project successfully', async () => {
    const projectData = {
      companyId: 'company-1',
      consultantId: 'consultant-1',
      name: 'New Project',
      description: 'Project description',
      status: 'planning' as const,
      priority: 'high' as const,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    };

    const createdProject: Project = {
      id: 'project-1',
      ...projectData,
      progress: 0,
      isTemplate: false,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.create).mockResolvedValue(createdProject);

    const result = await useCase.execute(projectData);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.id).toBe('project-1');
    expect(mockRepository.create).toHaveBeenCalledWith(projectData);
  });

  it('should create a project template', async () => {
    const templateData = {
      consultantId: 'consultant-1',
      name: 'Project Template',
      description: 'Template description',
      status: 'planning' as const,
      priority: 'medium' as const,
      isTemplate: true,
    };

    const createdTemplate: Project = {
      id: 'template-1',
      companyId: null,
      ...templateData,
      progress: 0,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.create).mockResolvedValue(createdTemplate);

    const result = await useCase.execute(templateData);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.id).toBe('template-1');
  });

  it('should handle repository error', async () => {
    const projectData = {
      companyId: 'company-1',
      consultantId: 'consultant-1',
      name: 'New Project',
      status: 'planning' as const,
      priority: 'high' as const,
    };

    vi.mocked(mockRepository.create).mockRejectedValue(new Error('Database error'));

    const result = await useCase.execute(projectData);

    expect(result.isSuccess).toBe(false);
    expect(result.error?.message).toContain('Database error');
  });

  it('should validate required fields', async () => {
    const invalidData = {
      companyId: 'company-1',
      // Missing required fields like name, status, priority
    } as any;

    const result = await useCase.execute(invalidData);

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBeDefined();
  });
});
