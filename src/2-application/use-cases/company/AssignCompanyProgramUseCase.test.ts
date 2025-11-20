/**
 * Unit Tests for AssignCompanyProgramUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignCompanyProgramUseCase } from './AssignCompanyProgramUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/6-core/result';
import { Company } from '@/3-domain/entities/Company';

describe('AssignCompanyProgramUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: AssignCompanyProgramUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByProgramId: vi.fn(),
      findByCity: vi.fn(),
      search: vi.fn(),
      findWithFilters: vi.fn(),
      getCompanyUsers: vi.fn(),
      addCompanyUser: vi.fn(),
      removeCompanyUser: vi.fn(),
    } as any;

    useCase = new AssignCompanyProgramUseCase(mockRepository);
  });

  const createMockCompany = (overrides?: Partial<Company>): Company => {
    return {
      id: 'company-1',
      programId: 'program-1',
      name: 'Test Company',
      legalName: undefined,
      taxNumber: undefined,
      tradeRegistryNumber: undefined,
      slug: 'test-company',
      email: undefined,
      phone: undefined,
      website: undefined,
      address: undefined,
      city: undefined,
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

  it('should assign program to company successfully as MASTER_ADMIN', async () => {
    const companyId = 'company-1';
    const programId = 'program-2';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId, programId: 'program-1' });
    const updatedCompany = createMockCompany({ id: companyId, programId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedCompany));

    const result = await useCase.execute(companyId, programId, userId, UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.programId).toBe(programId);
    expect(mockRepository.update).toHaveBeenCalledWith(companyId, { programId });
  });

  it('should fail when unauthorized user tries to assign program', async () => {
    const companyId = 'company-1';
    const programId = 'program-2';
    const userId = 'user-1';

    const result = await useCase.execute(companyId, programId, userId, UserRole.COMPANY_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.findById).not.toHaveBeenCalled();
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should fail when PROGRAM_MANAGER tries to assign program', async () => {
    const companyId = 'company-1';
    const programId = 'program-2';
    const userId = 'user-1';

    const result = await useCase.execute(companyId, programId, userId, UserRole.PROGRAM_MANAGER);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should fail when company not found', async () => {
    const companyId = 'non-existent';
    const programId = 'program-2';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(companyId, programId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bulunamadı');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository findById errors', async () => {
    const companyId = 'company-1';
    const programId = 'program-2';
    const userId = 'user-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(companyId, programId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository update errors', async () => {
    const companyId = 'company-1';
    const programId = 'program-2';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });
    const errorMessage = 'Update failed';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(companyId, programId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
