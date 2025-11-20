import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetAssignmentMatrixUseCase } from './GetAssignmentMatrixUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { ICompanyProjectAssignmentRepository } from '@/3-domain/interfaces/repositories/ICompanyProjectAssignmentRepository';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { Project } from '@/3-domain/entities/Project';
import { SubProject } from '@/3-domain/entities/SubProject';
import { Company } from '@/3-domain/entities/Company';
import { CompanyProjectAssignment } from '@/3-domain/entities/CompanyProjectAssignment';
import { Program } from '@/3-domain/entities/Program';
import { ProgramStatus } from '@/3-domain/enums/ProgramStatus';
import { Result } from '@/6-core/result/Result';

describe('GetAssignmentMatrixUseCase', () => {
  let mockProjectRepository: IProjectRepository;
  let mockSubProjectRepository: ISubProjectRepository;
  let mockCompanyRepository: ICompanyRepository;
  let mockAssignmentRepository: ICompanyProjectAssignmentRepository;
  let mockUserRepository: IUserRepository;
  let useCase: GetAssignmentMatrixUseCase;

  beforeEach(() => {
    mockProjectRepository = {
      findById: vi.fn(),
    } as any;

    mockSubProjectRepository = {
      findByProjectId: vi.fn(),
    } as any;

    mockCompanyRepository = {
      findById: vi.fn(),
      findByProgramId: vi.fn(),
    } as any;

    mockAssignmentRepository = {
      findByProject: vi.fn(),
    } as any;

    mockUserRepository = {
      getPrograms: vi.fn(),
    } as any;

    useCase = new GetAssignmentMatrixUseCase(
      mockProjectRepository,
      mockSubProjectRepository,
      mockCompanyRepository,
      mockAssignmentRepository,
      mockUserRepository
    );
  });

  it('should return error when projectId is empty', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Proje bilgisi eksik');
  });

  it('should return error when project not found', async () => {
    vi.mocked(mockProjectRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute('non-existent-id');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Proje bulunamadı');
  });

  it('should return matrix with programId', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: 'consultant-1',
      programId: 'program-1',
      status: 'in_progress',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const subProjects: SubProject[] = [
      {
        id: 'sub-project-1',
        projectId: 'project-1',
        name: 'Sub Project 1',
        description: 'Description 1',
        status: 'in_progress',
        orderIndex: 0,
        progress: 0,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const companies: Company[] = [
      {
        id: 'company-1',
        name: 'Company 1',
        slug: 'company-1',
        country: 'Turkey',
        city: 'Istanbul',
        sector: 'Technology',
        isActive: true,
        programId: 'program-1',
        maxUsers: 2,
        currentUsers: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const assignments: CompanyProjectAssignment[] = [
      {
        id: 'assignment-1',
        companyId: 'company-1',
        projectId: 'project-1',
        subProjectId: 'sub-project-1',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(subProjects);
    vi.mocked(mockAssignmentRepository.findByProject).mockResolvedValue(assignments);
    vi.mocked(mockCompanyRepository.findByProgramId).mockResolvedValue(Result.ok(companies));
    vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(companies[0]));

    const result = await useCase.execute('project-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.project.id).toBe('project-1');
    expect(result.value?.companies).toHaveLength(1);
    expect(result.value?.subProjects).toHaveLength(1);
    expect(result.value?.assignments).toHaveLength(1);
    expect(mockCompanyRepository.findByProgramId).toHaveBeenCalledWith('program-1');
  });

  it('should use consultant programs as fallback when programId is missing', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: 'consultant-1',
      programId: null,
      status: 'in_progress',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const subProjects: SubProject[] = [];
    const assignments: CompanyProjectAssignment[] = [];

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(subProjects);
    vi.mocked(mockAssignmentRepository.findByProject).mockResolvedValue(assignments);
    vi.mocked(mockUserRepository.getPrograms).mockResolvedValue(
      Result.ok([
        {
          id: 'program-1',
          name: 'Program 1',
          slug: 'program-1',
          status: ProgramStatus.ACTIVE,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          maxCompanies: 10,
          currentCompanies: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Program,
      ])
    );
    vi.mocked(mockCompanyRepository.findByProgramId).mockResolvedValue(Result.ok([]));

    const result = await useCase.execute('project-1');

    expect(result.isSuccess).toBe(true);
    expect(mockUserRepository.getPrograms).toHaveBeenCalledWith('consultant-1');
  });

  it('should include companies from existing assignments even if not in program', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: 'consultant-1',
      programId: 'program-1',
      status: 'in_progress',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const subProjects: SubProject[] = [];
    const assignments: CompanyProjectAssignment[] = [
      {
        id: 'assignment-1',
        companyId: 'company-2',
        projectId: 'project-1',
        subProjectId: 'sub-project-1',
        startDate: null,
        endDate: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const company2: Company = {
      id: 'company-2',
      name: 'Company 2',
      slug: 'company-2',
      country: 'Turkey',
      city: 'Ankara',
      sector: 'Finance',
      isActive: true,
      programId: 'program-2',
      maxUsers: 2,
      currentUsers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue(subProjects);
    vi.mocked(mockAssignmentRepository.findByProject).mockResolvedValue(assignments);
    vi.mocked(mockCompanyRepository.findByProgramId).mockResolvedValue(Result.ok([]));
    vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(company2));

    const result = await useCase.execute('project-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value?.companies).toHaveLength(1);
    expect(result.value?.companies[0].id).toBe('company-2');
  });

  it('should sort companies alphabetically', async () => {
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      companyId: null,
      consultantId: 'consultant-1',
      programId: 'program-1',
      status: 'in_progress',
      priority: 'medium',
      description: null,
      startDate: null,
      endDate: null,
      progress: 0,
      isTemplate: false,
      templateId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const companies: Company[] = [
      {
        id: 'company-2',
        name: 'Zebra Company',
        slug: 'zebra-company',
        country: 'Turkey',
        city: 'Istanbul',
        sector: 'Technology',
        isActive: true,
        programId: 'program-1',
        maxUsers: 2,
        currentUsers: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'company-1',
        name: 'Alpha Company',
        slug: 'alpha-company',
        country: 'Turkey',
        city: 'Istanbul',
        sector: 'Technology',
        isActive: true,
        programId: 'program-1',
        maxUsers: 2,
        currentUsers: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(mockProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(mockSubProjectRepository.findByProjectId).mockResolvedValue([]);
    vi.mocked(mockAssignmentRepository.findByProject).mockResolvedValue([]);
    vi.mocked(mockCompanyRepository.findByProgramId).mockResolvedValue(Result.ok(companies));
    vi.mocked(mockCompanyRepository.findById)
      .mockResolvedValueOnce(Result.ok(companies[0]))
      .mockResolvedValueOnce(Result.ok(companies[1]));

    const result = await useCase.execute('project-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value?.companies[0].name).toBe('Alpha Company');
    expect(result.value?.companies[1].name).toBe('Zebra Company');
  });
});
