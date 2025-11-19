/**
 * Unit Tests for ListCompaniesUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListCompaniesUseCase } from './ListCompaniesUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Company } from '@/3-domain/entities/Company';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('ListCompaniesUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: ListCompaniesUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByProgramId: vi.fn(),
      findByConsultantId: vi.fn(),
      findWithFilters: vi.fn(),
    };

    useCase = new ListCompaniesUseCase(mockRepository);
  });

  const createMockCompany = (overrides?: Partial<Company>): Company => {
    return {
      id: 'company-1',
      name: 'Test Company',
      taxNumber: '1234567890',
      email: 'test@company.com',
      phone: '+905551234567',
      address: 'Test Address',
      city: 'Istanbul',
      country: 'Turkey',
      isActive: true,
      programId: 'program-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should list all companies for MASTER_ADMIN', async () => {
    const mockCompanies = [
      createMockCompany({ id: 'company-1' }),
      createMockCompany({ id: 'company-2' }),
    ];

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(
      Result.ok({ companies: mockCompanies, total: 2 })
    );

    const result = await useCase.execute({}, 'admin-1', UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.companies).toEqual(mockCompanies);
    expect(result.value?.total).toBe(2);
    expect(mockRepository.findWithFilters).toHaveBeenCalled();
  });

  it('should return only own company for COMPANY_ADMIN', async () => {
    const userId = 'user-1';
    const companyId = 'company-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute({}, userId, UserRole.COMPANY_ADMIN, companyId);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.companies).toEqual([mockCompany]);
    expect(result.value?.total).toBe(1);
    expect(mockRepository.findById).toHaveBeenCalledWith(companyId);
  });

  it('should return error when COMPANY_ADMIN has no companyId', async () => {
    const userId = 'user-1';

    const result = await useCase.execute({}, userId, UserRole.COMPANY_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bilgisi bulunamadı');
  });

  it('should return error when company not found for COMPANY_ADMIN', async () => {
    const userId = 'user-1';
    const companyId = 'non-existent';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute({}, userId, UserRole.COMPANY_ADMIN, companyId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bulunamadı');
  });

  it('should return error for unauthorized role', async () => {
    const userId = 'user-1';

    const result = await useCase.execute({}, userId, 'unknown' as UserRole);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
  });

  it('should handle repository errors', async () => {
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute({}, 'admin-1', UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
