import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BulkAssignSubProjectsToCompaniesUseCase } from './BulkAssignSubProjectsToCompaniesUseCase';
import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import { ICompanyProjectAssignmentRepository } from '@/domain/interfaces/repositories/ICompanyProjectAssignmentRepository';
import { Project } from '@/domain/entities/Project';
import { SubProject } from '@/domain/entities/SubProject';
import { Company } from '@/domain/entities/Company';
import { CompanyProjectAssignment } from '@/domain/entities/CompanyProjectAssignment';
import { Result } from '@/core/result';

describe('BulkAssignSubProjectsToCompaniesUseCase', () => {
  let mockProjectRepository: IProjectRepository;
  let mockSubProjectRepository: ISubProjectRepository;
  let mockCompanyRepository: ICompanyRepository;
  let mockAssignmentRepository: ICompanyProjectAssignmentRepository;
  let useCase: BulkAssignSubProjectsToCompaniesUseCase;

  beforeEach(() => {
    mockProjectRepository = {
      findById: vi.fn(),
    } as any;

    mockSubProjectRepository = {
      findByProjectId: vi.fn(),
    } as any;

    mockCompanyRepository = {
      findById: vi.fn(),
    } as any;

    mockAssignmentRepository = {
      findByProject: vi.fn(),
      createMany: vi.fn(),
      deleteByCompanyAndSubProject: vi.fn(),
    } as any;

    useCase = new BulkAssignSubProjectsToCompaniesUseCase(
      mockProjectRepository,
      mockSubProjectRepository,
      mockCompanyRepository,
      mockAssignmentRepository
    );
  });

  it('should return error when projectId is missing', async () => {
    const request = {
      projectId: '',
      assignments: [],
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.code).toBe('PROJECT_ID_MISSING');
  });

  it('should return error when project not found', async () => {
    vi.mocked(mockProjectRepository.findById).mockResolvedValue(null);

    const request = {
      projectId: 'non-existent',
      assignments: [],
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.code).toBe('PROJECT_NOT_FOUND');
  });

  it('should create new assignments', async () => {
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

    const subProjects: SubProject[] = [
      {
        id: 'sub-project-1',
        projectId: 'project-1',
        name: 'Sub Project 1',
        description: null,
        status: 'active',
        orderIndex: 0,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const company: Company = {
      id: 'company-1',
      name: 'Company 1',
      city: 'Istanbul',
      sector: 'Technology',
      isActive: true,
      programId: 'program-1',
      maxUsers: 2,
      currentUsers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(subProjects);
    vi.mocked(mockAssignmentRepository.findByProject).mockResolvedValue([]);
    vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(company));
    vi.mocked(mockAssignmentRepository.createMany).mockResolvedValue([
      {
        id: 'assignment-1',
        companyId: 'company-1',
        projectId: 'project-1',
        subProjectId: 'sub-project-1',
        startDate: null,
        endDate: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const request = {
      projectId: 'project-1',
      assignments: [
        {
          companyId: 'company-1',
          subProjectIds: ['sub-project-1'],
        },
      ],
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.successCount).toBe(1);
    expect(result.value?.removeCount).toBe(0);
    expect(mockAssignmentRepository.createMany).toHaveBeenCalled();
  });

  it('should remove existing assignments when not in desired list', async () => {
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

    const subProjects: SubProject[] = [
      {
        id: 'sub-project-1',
        projectId: 'project-1',
        name: 'Sub Project 1',
        description: null,
        status: 'active',
        orderIndex: 0,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const company: Company = {
      id: 'company-1',
      name: 'Company 1',
      city: 'Istanbul',
      sector: 'Technology',
      isActive: true,
      programId: 'program-1',
      maxUsers: 2,
      currentUsers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingAssignment: CompanyProjectAssignment = {
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
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(subProjects);
    vi.mocked(mockAssignmentRepository.findByProject).mockResolvedValue([existingAssignment]);
    vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(company));
    vi.mocked(mockAssignmentRepository.deleteByCompanyAndSubProject).mockResolvedValue();

    const request = {
      projectId: 'project-1',
      assignments: [
        {
          companyId: 'company-1',
          subProjectIds: [], // Empty list means remove all
        },
      ],
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.successCount).toBe(0);
    expect(result.value?.removeCount).toBe(1);
    expect(mockAssignmentRepository.deleteByCompanyAndSubProject).toHaveBeenCalled();
  });

  it('should return error for invalid sub-project IDs', async () => {
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

    const subProjects: SubProject[] = [
      {
        id: 'sub-project-1',
        projectId: 'project-1',
        name: 'Sub Project 1',
        description: null,
        status: 'active',
        orderIndex: 0,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const company: Company = {
      id: 'company-1',
      name: 'Company 1',
      city: 'Istanbul',
      sector: 'Technology',
      isActive: true,
      programId: 'program-1',
      maxUsers: 2,
      currentUsers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(subProjects);
    vi.mocked(mockAssignmentRepository.findByProject).mockResolvedValue([]);
    vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(company));

    const request = {
      projectId: 'project-1',
      assignments: [
        {
          companyId: 'company-1',
          subProjectIds: ['invalid-sub-project-id'],
        },
      ],
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.errors.length).toBeGreaterThan(0);
    expect(result.value?.errors[0].message).toContain('Alt proje bu projeye ait değil');
  });

  it('should return error for non-existent company', async () => {
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

    const subProjects: SubProject[] = [];

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(subProjects);
    vi.mocked(mockAssignmentRepository.findByProject).mockResolvedValue([]);
    vi.mocked(mockCompanyRepository.findById).mockResolvedValue(
      Result.fail(new Error('Not found'))
    );

    const request = {
      projectId: 'project-1',
      assignments: [
        {
          companyId: 'non-existent-company',
          subProjectIds: [],
        },
      ],
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.errors.length).toBeGreaterThan(0);
    expect(result.value?.errors[0].message).toContain('Firma bulunamadı');
  });
});
