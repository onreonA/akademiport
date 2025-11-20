/**
 * Unit Tests for GetCompanyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCompanyUseCase } from './GetCompanyUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Company } from '@/3-domain/entities/Company';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('GetCompanyUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: GetCompanyUseCase;

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

    useCase = new GetCompanyUseCase(mockRepository);
  });

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

  it('should get company successfully for MASTER_ADMIN', async () => {
    const companyId = 'company-1';
    const userId = 'admin-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockCompany);
    expect(mockRepository.findById).toHaveBeenCalledWith(companyId);
  });

  it('should get company successfully for COMPANY_ADMIN viewing own company', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(companyId, userId, UserRole.COMPANY_ADMIN, companyId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockCompany);
  });

  it('should return error when COMPANY_ADMIN tries to view another company', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const userCompanyId = 'company-2';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(companyId, userId, UserRole.COMPANY_ADMIN, userCompanyId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Sadece kendi firmanızı görüntüleyebilirsiniz'
    );
  });

  it('should return error when company not found', async () => {
    const companyId = 'non-existent';
    const userId = 'admin-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bulunamadı');
  });

  it('should return error when repository fails', async () => {
    const companyId = 'company-1';
    const userId = 'admin-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should return error for unauthorized role', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    // Using a role that doesn't have access
    const result = await useCase.execute(companyId, userId, 'unknown' as UserRole);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
  });
});
