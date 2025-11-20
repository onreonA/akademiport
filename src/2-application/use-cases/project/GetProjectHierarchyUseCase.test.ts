/**
 * Unit Tests for GetProjectHierarchyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetProjectHierarchyUseCase } from './GetProjectHierarchyUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Project } from '@/3-domain/entities/Project';
import { SubProject } from '@/3-domain/entities/SubProject';
import { Task } from '@/3-domain/entities/Task';
import { AppError } from '@/6-core/errors/AppError';

describe('GetProjectHierarchyUseCase', () => {
  let mockProjectRepository: IProjectRepository;
  let mockSubProjectRepository: ISubProjectRepository;
  let mockTaskRepository: ITaskRepository;
  let useCase: GetProjectHierarchyUseCase;

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
      findByCompanyId: vi.fn(),
      findByConsultantId: vi.fn(),
      findByTemplateId: vi.fn(),
      restore: vi.fn(),
      findDeleted: vi.fn(),
    } as any;

    mockSubProjectRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByProjectId: vi.fn(),
      restore: vi.fn(),
      findDeleted: vi.fn(),
      exists: vi.fn(),
      updateProgress: vi.fn(),
      updateOrder: vi.fn(),
    } as any;

    mockTaskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findBySubProjectId: vi.fn(),
      findBySubProjectIds: vi.fn(),
      findByAssignedUserId: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assignTo: vi.fn(),
      exists: vi.fn(),
      restore: vi.fn(),
      findDeleted: vi.fn(),
      updateStatus: vi.fn(),
      updateOrder: vi.fn(),
    };

    useCase = new GetProjectHierarchyUseCase(
      mockProjectRepository,
      mockSubProjectRepository,
      mockTaskRepository
    );
  });

  const createMockProject = (overrides?: Partial<Project>): Project => {
    return {
      id: 'project-1',
      companyId: 'company-1',
      consultantId: 'consultant-1',
      programId: null,
      name: 'Test Project',
      description: 'Test Description',
      status: 'todo',
      priority: 'high',
      progress: 0,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isTemplate: false,
      templateId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should get project hierarchy successfully', async () => {
    const projectId = 'project-1';
    const mockProject = createMockProject({ id: projectId });
    const mockSubProjects: SubProject[] = [
      {
        id: 'subproject-1',
        projectId,
        name: 'SubProject 1',
        description: 'Description 1',
        status: 'in_progress',
        orderIndex: 1,
        progress: 0,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        subProjectId: 'subproject-1',
        assignedTo: null,
        title: 'Task 1',
        description: 'Task Description',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        completedAt: null,
        approvedAt: null,
        approvedBy: null,
        orderIndex: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(mockProject);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(mockSubProjects);
    vi.mocked(mockTaskRepository.findBySubProjectIds).mockResolvedValue(mockTasks);

    const result = await useCase.execute(projectId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.project.id).toBe(projectId);
    expect(result.value?.subProjects).toHaveLength(1);
    expect(result.value?.subProjects[0].tasks).toHaveLength(1);
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
    expect(mockSubProjectRepository.findByProjectId).toHaveBeenCalledWith(projectId);
    expect(mockTaskRepository.findBySubProjectIds).toHaveBeenCalledWith(['subproject-1']);
  });

  it('should return error when project not found', async () => {
    const projectId = 'non-existent';

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(projectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Project not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockSubProjectRepository.findByProjectId).not.toHaveBeenCalled();
  });

  it('should handle empty sub-projects', async () => {
    const projectId = 'project-1';
    const mockProject = createMockProject({ id: projectId });

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(mockProject);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue([]);

    const result = await useCase.execute(projectId);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.subProjects).toHaveLength(0);
    expect(result.value?.stats.totalSubProjects).toBe(0);
    expect(mockTaskRepository.findBySubProjectIds).not.toHaveBeenCalled();
  });

  it('should calculate progress correctly', async () => {
    const projectId = 'project-1';
    const mockProject = createMockProject({ id: projectId });
    const mockSubProjects: SubProject[] = [
      {
        id: 'subproject-1',
        projectId,
        name: 'SubProject 1',
        description: 'Description 1',
        status: 'in_progress',
        orderIndex: 1,
        progress: 0,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        subProjectId: 'subproject-1',
        assignedTo: null,
        title: 'Task 1',
        description: null,
        status: 'done',
        priority: 'medium',
        dueDate: null,
        completedAt: new Date(),
        approvedAt: null,
        approvedBy: null,
        orderIndex: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'task-2',
        subProjectId: 'subproject-1',
        assignedTo: null,
        title: 'Task 2',
        description: null,
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        completedAt: null,
        approvedAt: null,
        approvedBy: null,
        orderIndex: 2,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(mockProject);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(mockSubProjects);
    vi.mocked(mockTaskRepository.findBySubProjectIds).mockResolvedValue(mockTasks);

    const result = await useCase.execute(projectId);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.subProjects[0].progress).toBe(50); // 1 done out of 2 tasks
    expect(result.value?.stats.overallProgress).toBe(50);
    expect(result.value?.stats.completedTasks).toBe(1);
    expect(result.value?.stats.todoTasks).toBe(1);
  });

  it('should handle exceptions', async () => {
    const projectId = 'project-1';
    const errorMessage = 'Unexpected error';

    vi.mocked(mockProjectRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(projectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
