/**
 * Unit Tests for UpdateCompanyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateCompanyUseCase } from './UpdateCompanyUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Company } from '@/3-domain/entities/Company';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('UpdateCompanyUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: UpdateCompanyUseCase;

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

    useCase = new UpdateCompanyUseCase(mockRepository);
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

  it('should update company successfully for MASTER_ADMIN', async () => {
    const companyId = 'company-1';
    const userId = 'admin-1';
    const updateDto = { name: 'Updated Company Name' };
    const existingCompany = createMockCompany({ id: companyId });
    const updatedCompany = createMockCompany({ id: companyId, name: 'Updated Company Name' });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingCompany));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedCompany));

    const result = await useCase.execute(companyId, updateDto, userId, UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedCompany);
    expect(mockRepository.findById).toHaveBeenCalledWith(companyId);
    expect(mockRepository.update).toHaveBeenCalledWith(companyId, updateDto);
  });

  it('should update company successfully for COMPANY_ADMIN viewing own company', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const updateDto = { name: 'Updated Name' };
    const existingCompany = createMockCompany({ id: companyId });
    const updatedCompany = createMockCompany({ id: companyId, name: 'Updated Name' });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingCompany));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedCompany));

    const result = await useCase.execute(
      companyId,
      updateDto,
      userId,
      UserRole.COMPANY_ADMIN,
      companyId
    );

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedCompany);
  });

  it('should return error when COMPANY_ADMIN tries to update another company', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const userCompanyId = 'company-2';
    const updateDto = { name: 'Updated Name' };
    const existingCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingCompany));

    const result = await useCase.execute(
      companyId,
      updateDto,
      userId,
      UserRole.COMPANY_ADMIN,
      userCompanyId
    );

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Sadece kendi firmanızı güncelleyebilirsiniz'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when company not found', async () => {
    const companyId = 'non-existent';
    const userId = 'admin-1';
    const updateDto = { name: 'Updated Name' };

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(companyId, updateDto, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bulunamadı');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error for unauthorized role', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const updateDto = { name: 'Updated Name' };
    const existingCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingCompany));

    const result = await useCase.execute(companyId, updateDto, userId, UserRole.COMPANY_USER);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const companyId = 'company-1';
    const userId = 'admin-1';
    const updateDto = { name: 'Updated Name' };
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(companyId, updateDto, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
