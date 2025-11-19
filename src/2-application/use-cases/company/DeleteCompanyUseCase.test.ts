/**
 * Unit Tests for DeleteCompanyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteCompanyUseCase } from './DeleteCompanyUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Company } from '@/3-domain/entities/Company';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('DeleteCompanyUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: DeleteCompanyUseCase;

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

    useCase = new DeleteCompanyUseCase(mockRepository);
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
      currentUsers: 0,
      ...overrides,
    };
  };

  it('should delete company successfully for MASTER_ADMIN', async () => {
    const companyId = 'company-1';
    const userId = 'admin-1';
    const mockCompany = createMockCompany({ id: companyId, currentUsers: 0 });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.delete).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(companyId);
    expect(mockRepository.delete).toHaveBeenCalledWith(companyId);
  });

  it('should return error when COMPANY_ADMIN tries to delete company', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';

    const result = await useCase.execute(companyId, userId, UserRole.COMPANY_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when company not found', async () => {
    const companyId = 'non-existent';
    const userId = 'admin-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bulunamadı');
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should return error when company has active users', async () => {
    const companyId = 'company-1';
    const userId = 'admin-1';
    const mockCompany = createMockCompany({ id: companyId, currentUsers: 5 });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Aktif kullanıcısı olan firma silinemez'
    );
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const companyId = 'company-1';
    const userId = 'admin-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
