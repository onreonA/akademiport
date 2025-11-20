/**
 * Unit Tests for CreateProjectFromTemplateUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProjectFromTemplateUseCase } from './CreateProjectFromTemplateUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import type { Project } from '@/3-domain/entities/Project';
import type { SubProject } from '@/3-domain/entities/SubProject';
import type { Task } from '@/3-domain/entities/Task';

describe('CreateProjectFromTemplateUseCase', () => {
  let mockProjectRepository: IProjectRepository;
  let mockSubProjectRepository: ISubProjectRepository;
  let mockTaskRepository: ITaskRepository;
  let useCase: CreateProjectFromTemplateUseCase;

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
      findDeleted: vi.fn(),
    } as any;

    mockSubProjectRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByProjectId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      restore: vi.fn(),
      findDeleted: vi.fn(),
      exists: vi.fn(),
      updateProgress: vi.fn(),
      updateOrder: vi.fn(),
    } as any;

    mockTaskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySubProjectId: vi.fn(),
      findBySubProjectIds: vi.fn(),
      findByAssignedUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      restore: vi.fn(),
      findDeleted: vi.fn(),
      exists: vi.fn(),
      updateStatus: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assignTo: vi.fn(),
      updateOrder: vi.fn(),
    } as any;

    useCase = new CreateProjectFromTemplateUseCase(
      mockProjectRepository,
      mockSubProjectRepository,
      mockTaskRepository
    );
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

  const createMockProject = (overrides?: Partial<Project>): Project => {
    return {
      id: 'project-1',
      companyId: 'company-1',
      consultantId: 'consultant-1',
      programId: 'program-1',
      name: 'New Project',
      description: 'Project description',
      status: 'todo',
      priority: 'medium',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      progress: 0,
      isTemplate: false,
      templateId: 'template-1',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  const createMockSubProject = (overrides?: Partial<SubProject>): SubProject => {
    return {
      id: 'subproject-1',
      projectId: 'template-1',
      name: 'Sub Project',
      description: 'Sub project description',
      status: 'todo',
      orderIndex: 1,
      progress: 0,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  const createMockTask = (overrides?: Partial<Task>): Task => {
    return {
      id: 'task-1',
      subProjectId: 'subproject-1',
      title: 'Task',
      description: 'Task description',
      status: 'todo',
      priority: 'medium',
      assignedUserId: null,
      orderIndex: 1,
      completedAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should create project from template successfully', async () => {
      const template = createMockTemplate();
      const newProject = createMockProject();
      const templateSubProjects = [createMockSubProject()];
      const templateTasks = [createMockTask()];
      const newSubProject = createMockSubProject({
        id: 'subproject-2',
        projectId: newProject.id,
      });

      vi.mocked(mockProjectRepository.findById).mockResolvedValue(template);
      vi.mocked(mockProjectRepository.create).mockResolvedValue(newProject);
      vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(templateSubProjects);
      vi.mocked(mockSubProjectRepository.create).mockResolvedValue(newSubProject);
      vi.mocked(mockTaskRepository.findBySubProjectId).mockResolvedValue(templateTasks);
      vi.mocked(mockTaskRepository.create).mockResolvedValue(createMockTask({ id: 'task-2' }));

      const result = await useCase.execute({
        templateId: 'template-1',
        companyId: 'company-1',
        consultantId: 'consultant-1',
        name: 'New Project',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe('project-1');
      expect(mockProjectRepository.findById).toHaveBeenCalledWith('template-1');
      expect(mockProjectRepository.create).toHaveBeenCalled();
      expect(mockSubProjectRepository.findByProjectId).toHaveBeenCalledWith('template-1');
      expect(mockSubProjectRepository.create).toHaveBeenCalled();
      expect(mockTaskRepository.findBySubProjectId).toHaveBeenCalled();
      expect(mockTaskRepository.create).toHaveBeenCalled();
    });

    it('should return error when template not found', async () => {
      vi.mocked(mockProjectRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute({
        templateId: 'non-existent-template',
        companyId: 'company-1',
        name: 'New Project',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('not found');
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when project is not a template', async () => {
      const nonTemplate = createMockTemplate({ isTemplate: false });

      vi.mocked(mockProjectRepository.findById).mockResolvedValue(nonTemplate);

      const result = await useCase.execute({
        templateId: 'project-1',
        companyId: 'company-1',
        name: 'New Project',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('not a template');
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should create template duplicate when companyId is not provided', async () => {
      const template = createMockTemplate();
      const duplicateTemplate = createMockProject({
        id: 'template-2',
        companyId: null,
        isTemplate: true,
      });

      vi.mocked(mockProjectRepository.findById).mockResolvedValue(template);
      vi.mocked(mockProjectRepository.create).mockResolvedValue(duplicateTemplate);
      vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue([]);

      const result = await useCase.execute({
        templateId: 'template-1',
        name: 'Duplicate Template',
      });

      expect(result.isSuccess).toBe(true);
      expect(mockProjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isTemplate: true,
          companyId: undefined,
        })
      );
    });

    it('should copy all sub-projects and tasks from template', async () => {
      const template = createMockTemplate();
      const newProject = createMockProject();
      const templateSubProjects = [
        createMockSubProject({ id: 'subproject-1', orderIndex: 1 }),
        createMockSubProject({ id: 'subproject-2', orderIndex: 2 }),
      ];
      const templateTasks1 = [createMockTask({ id: 'task-1' })];
      const templateTasks2 = [createMockTask({ id: 'task-2' })];

      vi.mocked(mockProjectRepository.findById).mockResolvedValue(template);
      vi.mocked(mockProjectRepository.create).mockResolvedValue(newProject);
      vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(templateSubProjects);
      vi.mocked(mockSubProjectRepository.create)
        .mockResolvedValueOnce(createMockSubProject({ id: 'new-subproject-1' }))
        .mockResolvedValueOnce(createMockSubProject({ id: 'new-subproject-2' }));
      vi.mocked(mockTaskRepository.findBySubProjectId)
        .mockResolvedValueOnce(templateTasks1)
        .mockResolvedValueOnce(templateTasks2);
      vi.mocked(mockTaskRepository.create).mockResolvedValue(createMockTask());

      const result = await useCase.execute({
        templateId: 'template-1',
        companyId: 'company-1',
        name: 'New Project',
      });

      expect(result.isSuccess).toBe(true);
      expect(mockSubProjectRepository.create).toHaveBeenCalledTimes(2);
      expect(mockTaskRepository.findBySubProjectId).toHaveBeenCalledTimes(2);
      expect(mockTaskRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockProjectRepository.findById).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute({
        templateId: 'template-1',
        companyId: 'company-1',
        name: 'New Project',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
