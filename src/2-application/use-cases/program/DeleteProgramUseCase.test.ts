/**
 * Unit Tests for DeleteProgramUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteProgramUseCase } from './DeleteProgramUseCase';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Program } from '@/3-domain/entities/Program';
import { Company } from '@/3-domain/entities/Company';
import { UserRole } from '@/3-domain/enums/UserRole';
import { ProgramStatus } from '@/3-domain/enums/ProgramStatus';
import { Result } from '@/6-core/result/Result';

describe('DeleteProgramUseCase', () => {
  let mockProgramRepository: IProgramRepository;
  let mockCompanyRepository: ICompanyRepository;
  let useCase: DeleteProgramUseCase;

  beforeEach(() => {
    mockProgramRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByManagerId: vi.fn(),
      findByStatus: vi.fn(),
      findByCity: vi.fn(),
      search: vi.fn(),
      addConsultant: vi.fn(),
      removeConsultant: vi.fn(),
      getConsultants: vi.fn(),
    } as any;

    mockCompanyRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByProgramId: vi.fn(),
      findByCity: vi.fn(),
      search: vi.fn(),
      getCompanyUsers: vi.fn(),
      addCompanyUser: vi.fn(),
      removeCompanyUser: vi.fn(),
    } as any;

    useCase = new DeleteProgramUseCase(mockProgramRepository, mockCompanyRepository);
  });

  const createMockProgram = (overrides?: Partial<Program>): Program => {
    return {
      id: 'program-1',
      name: 'Test Program',
      description: 'Test Description',
      slug: 'test-program',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      maxCompanies: 10,
      currentCompanies: 0,
      status: ProgramStatus.ACTIVE,
      programManagerId: 'manager-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  const createMockCompany = (overrides?: Partial<Company>): Company => {
    return {
      id: 'company-1',
      programId: 'program-1',
      name: 'Test Company',
      legalName: undefined,
      taxNumber: '1234567890',
      tradeRegistryNumber: undefined,
      slug: 'test-company',
      email: 'test@company.com',
      phone: '+905551234567',
      website: undefined,
      address: 'Test Address',
      city: 'Istanbul',
      district: undefined,
      postalCode: undefined,
      country: 'Turkey',
      sector: undefined,
      subSector: undefined,
      employeeCount: undefined,
      foundationYear: undefined,
      logoUrl: undefined,
      isActive: true,
      maxUsers: 10,
      currentUsers: 0,
      settings: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: undefined,
      updatedBy: undefined,
      ...overrides,
    };
  };

  it('should delete program successfully when no active companies', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const input = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const mockProgram = createMockProgram({ id: programId });
    const inactiveCompanies = [
      createMockCompany({ id: 'company-1', isActive: false }),
      createMockCompany({ id: 'company-2', isActive: false }),
    ];

    vi.mocked(mockProgramRepository.findById).mockResolvedValue(Result.ok(mockProgram));
    vi.mocked(mockCompanyRepository.findByProgramId).mockResolvedValue(
      Result.ok(inactiveCompanies)
    );
    vi.mocked(mockProgramRepository.delete).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(mockProgramRepository.findById).toHaveBeenCalledWith(programId);
    expect(mockCompanyRepository.findByProgramId).toHaveBeenCalledWith(programId);
    expect(mockProgramRepository.delete).toHaveBeenCalledWith(programId);
  });

  it('should return error when user is not MASTER_ADMIN', async () => {
    const programId = 'program-1';
    const userId = 'manager-1';
    const input = {
      id: programId,
      userId,
      userRole: UserRole.PROGRAM_MANAGER,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Sadece Master Admin program silebilir'
    );
    expect(mockProgramRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when program not found', async () => {
    const programId = 'non-existent';
    const userId = 'admin-1';
    const input = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };

    vi.mocked(mockProgramRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program bulunamadı');
    expect(mockProgramRepository.delete).not.toHaveBeenCalled();
  });

  it('should return error when program has active companies', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const input = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const mockProgram = createMockProgram({ id: programId });
    const activeCompanies = [
      createMockCompany({ id: 'company-1', isActive: true }),
      createMockCompany({ id: 'company-2', isActive: true }),
    ];

    vi.mocked(mockProgramRepository.findById).mockResolvedValue(Result.ok(mockProgram));
    vi.mocked(mockCompanyRepository.findByProgramId).mockResolvedValue(Result.ok(activeCompanies));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('aktif firma bulunmaktadır');
    expect(mockProgramRepository.delete).not.toHaveBeenCalled();
  });

  it('should return error when company check fails', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const input = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const mockProgram = createMockProgram({ id: programId });
    const errorMessage = 'Database error';

    vi.mocked(mockProgramRepository.findById).mockResolvedValue(Result.ok(mockProgram));
    vi.mocked(mockCompanyRepository.findByProgramId).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma kontrolü yapılamadı');
    expect(mockProgramRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const input = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const errorMessage = 'Database error';

    vi.mocked(mockProgramRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(errorMessage);
  });

  it('should handle exceptions', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const input = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockProgramRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(errorMessage);
  });
});
