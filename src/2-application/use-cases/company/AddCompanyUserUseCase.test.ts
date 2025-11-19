/**
 * Unit Tests for AddCompanyUserUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AddCompanyUserUseCase } from './AddCompanyUserUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Company } from '@/3-domain/entities/Company';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('AddCompanyUserUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: AddCompanyUserUseCase;

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
      addCompanyUser: vi.fn(),
    };

    useCase = new AddCompanyUserUseCase(mockRepository);
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
      maxUsers: 10,
      currentUsers: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should add user to company successfully for MASTER_ADMIN', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-1';
    const userId = 'admin-1';
    const mockCompany = createMockCompany({ id: companyId, currentUsers: 5, maxUsers: 10 });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.addCompanyUser).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(companyId);
    expect(mockRepository.addCompanyUser).toHaveBeenCalledWith(companyId, targetUserId);
  });

  it('should add user to company successfully for COMPANY_ADMIN viewing own company', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-1';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId, currentUsers: 5, maxUsers: 10 });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.addCompanyUser).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(
      companyId,
      targetUserId,
      userId,
      UserRole.COMPANY_ADMIN,
      companyId
    );

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.addCompanyUser).toHaveBeenCalled();
  });

  it('should return error when COMPANY_ADMIN tries to add user to another company', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-1';
    const userId = 'user-1';
    const userCompanyId = 'company-2';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(
      companyId,
      targetUserId,
      userId,
      UserRole.COMPANY_ADMIN,
      userCompanyId
    );

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Sadece kendi firmanıza kullanıcı ekleyebilirsiniz'
    );
    expect(mockRepository.addCompanyUser).not.toHaveBeenCalled();
  });

  it('should return error when company not found', async () => {
    const companyId = 'non-existent';
    const targetUserId = 'user-1';
    const userId = 'admin-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bulunamadı');
    expect(mockRepository.addCompanyUser).not.toHaveBeenCalled();
  });

  it('should return error when company has reached max users', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-1';
    const userId = 'admin-1';
    const mockCompany = createMockCompany({ id: companyId, currentUsers: 10, maxUsers: 10 });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Maksimum kullanıcı sayısına ulaşıldı');
    expect(mockRepository.addCompanyUser).not.toHaveBeenCalled();
  });

  it('should return error for unauthorized role', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-1';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.COMPANY_USER);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.addCompanyUser).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-1';
    const userId = 'admin-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
