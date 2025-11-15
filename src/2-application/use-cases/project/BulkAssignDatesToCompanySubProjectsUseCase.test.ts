import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BulkAssignDatesToCompanySubProjectsUseCase } from './BulkAssignDatesToCompanySubProjectsUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { ICompanyProjectAssignmentRepository } from '@/3-domain/interfaces/repositories/ICompanyProjectAssignmentRepository';
import { Project } from '@/3-domain/entities/Project';
import { SubProject } from '@/3-domain/entities/SubProject';
import { CompanyProjectAssignment } from '@/3-domain/entities/CompanyProjectAssignment';

describe('BulkAssignDatesToCompanySubProjectsUseCase', () => {
  let mockProjectRepository: IProjectRepository;
  let mockSubProjectRepository: ISubProjectRepository;
  let mockAssignmentRepository: ICompanyProjectAssignmentRepository;
  let useCase: BulkAssignDatesToCompanySubProjectsUseCase;

  beforeEach(() => {
    mockProjectRepository = {
      findById: vi.fn(),
    } as any;

    mockSubProjectRepository = {
      findById: vi.fn(),
    } as any;

    mockAssignmentRepository = {
      findBySubProject: vi.fn(),
      updateMany: vi.fn(),
    } as any;

    useCase = new BulkAssignDatesToCompanySubProjectsUseCase(
      mockProjectRepository,
      mockSubProjectRepository,
      mockAssignmentRepository
    );
  });

  it('should return error when projectId is missing', async () => {
    const request = {
      projectId: '',
      subProjectId: 'sub-project-1',
      dates: [],
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.code).toBe('PROJECT_ID_MISSING');
  });

  it('should return error when subProjectId is missing', async () => {
    const request = {
      projectId: 'project-1',
      subProjectId: '',
      dates: [],
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.code).toBe('SUBPROJECT_ID_MISSING');
  });

  it('should return error when project not found', async () => {
    vi.mocked(mockProjectRepository.findById).mockResolvedValue(null);

    const request = {
      projectId: 'non-existent',
      subProjectId: 'sub-project-1',
      dates: [],
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.code).toBe('PROJECT_NOT_FOUND');
  });

  it('should return error when sub-project not in project', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: null,
      programId: null,
      status: 'active',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const subProject: SubProject = {
      id: 'sub-project-1',
      projectId: 'different-project',
      name: 'Sub Project 1',
      description: null,
      status: 'active',
      orderIndex: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findById).mockResolvedValue(subProject);

    const request = {
      projectId: 'project-1',
      subProjectId: 'sub-project-1',
      dates: [],
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.code).toBe('SUBPROJECT_NOT_IN_PROJECT');
  });

  it('should update dates for existing assignments', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: null,
      programId: null,
      status: 'active',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const subProject: SubProject = {
      id: 'sub-project-1',
      projectId: 'project-1',
      name: 'Sub Project 1',
      description: null,
      status: 'active',
      orderIndex: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const assignment: CompanyProjectAssignment = {
      id: 'assignment-1',
      companyId: 'company-1',
      projectId: 'project-1',
      subProjectId: 'sub-project-1',
      startDate: null,
      endDate: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findById).mockResolvedValue(subProject);
    vi.mocked(mockAssignmentRepository.findBySubProject).mockResolvedValue([assignment]);
    vi.mocked(mockAssignmentRepository.updateMany).mockResolvedValue([assignment]);

    const request = {
      projectId: 'project-1',
      subProjectId: 'sub-project-1',
      dates: [
        {
          companyId: 'company-1',
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-12-31T00:00:00.000Z',
        },
      ],
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.updatedCount).toBe(1);
    expect(mockAssignmentRepository.updateMany).toHaveBeenCalled();
  });

  it('should return error for company not assigned to sub-project', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: null,
      programId: null,
      status: 'active',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const subProject: SubProject = {
      id: 'sub-project-1',
      projectId: 'project-1',
      name: 'Sub Project 1',
      description: null,
      status: 'active',
      orderIndex: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findById).mockResolvedValue(subProject);
    vi.mocked(mockAssignmentRepository.findBySubProject).mockResolvedValue([]);

    const request = {
      projectId: 'project-1',
      subProjectId: 'sub-project-1',
      dates: [
        {
          companyId: 'non-assigned-company',
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-12-31T00:00:00.000Z',
        },
      ],
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.errors.length).toBeGreaterThan(0);
    expect(result.value?.errors[0].message).toContain('Firma bu alt projeye atanmış değil');
  });

  it('should validate date format', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: null,
      programId: null,
      status: 'active',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const subProject: SubProject = {
      id: 'sub-project-1',
      projectId: 'project-1',
      name: 'Sub Project 1',
      description: null,
      status: 'active',
      orderIndex: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const assignment: CompanyProjectAssignment = {
      id: 'assignment-1',
      companyId: 'company-1',
      projectId: 'project-1',
      subProjectId: 'sub-project-1',
      startDate: null,
      endDate: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findById).mockResolvedValue(subProject);
    vi.mocked(mockAssignmentRepository.findBySubProject).mockResolvedValue([assignment]);

    const request = {
      projectId: 'project-1',
      subProjectId: 'sub-project-1',
      dates: [
        {
          companyId: 'company-1',
          startDate: 'invalid-date',
          endDate: '2025-12-31T00:00:00.000Z',
        },
      ],
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.errors.length).toBeGreaterThan(0);
    expect(result.value?.errors[0].message).toContain('Başlangıç tarihi geçersiz');
  });

  it('should validate start date is before end date', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: null,
      programId: null,
      status: 'active',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const subProject: SubProject = {
      id: 'sub-project-1',
      projectId: 'project-1',
      name: 'Sub Project 1',
      description: null,
      status: 'active',
      orderIndex: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const assignment: CompanyProjectAssignment = {
      id: 'assignment-1',
      companyId: 'company-1',
      projectId: 'project-1',
      subProjectId: 'sub-project-1',
      startDate: null,
      endDate: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findById).mockResolvedValue(subProject);
    vi.mocked(mockAssignmentRepository.findBySubProject).mockResolvedValue([assignment]);

    const request = {
      projectId: 'project-1',
      subProjectId: 'sub-project-1',
      dates: [
        {
          companyId: 'company-1',
          startDate: '2025-12-31T00:00:00.000Z',
          endDate: '2025-01-01T00:00:00.000Z', // End before start
        },
      ],
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.errors.length).toBeGreaterThan(0);
    expect(result.value?.errors[0].message).toContain(
      'Başlangıç tarihi bitiş tarihinden sonra olamaz'
    );
  });
});
