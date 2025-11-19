/**
 * Unit Tests for ListCompanyUsersUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListCompanyUsersUseCase } from './ListCompanyUsersUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Company } from '@/3-domain/entities/Company';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('ListCompanyUsersUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: ListCompanyUsersUseCase;

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
      getCompanyUsers: vi.fn(),
    };

    useCase = new ListCompanyUsersUseCase(mockRepository);
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

  const createMockUser = (overrides?: Partial<User>): User => {
    return {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      role: UserRole.COMPANY_USER,
      companyId: 'company-1',
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should list company users successfully for MASTER_ADMIN', async () => {
    const companyId = 'company-1';
    const userId = 'admin-1';
    const mockCompany = createMockCompany({ id: companyId });
    const mockUsers = [createMockUser({ id: 'user-1' }), createMockUser({ id: 'user-2' })];

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.getCompanyUsers).mockResolvedValue(Result.ok(mockUsers));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockUsers);
    expect(mockRepository.findById).toHaveBeenCalledWith(companyId);
    expect(mockRepository.getCompanyUsers).toHaveBeenCalledWith(companyId);
  });

  it('should list company users successfully for COMPANY_ADMIN viewing own company', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });
    const mockUsers = [createMockUser({ id: 'user-1' })];

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.getCompanyUsers).mockResolvedValue(Result.ok(mockUsers));

    const result = await useCase.execute(companyId, userId, UserRole.COMPANY_ADMIN, companyId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockUsers);
  });

  it('should return error when COMPANY_ADMIN tries to list another company users', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const userCompanyId = 'company-2';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(companyId, userId, UserRole.COMPANY_ADMIN, userCompanyId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Sadece kendi firmanızın kullanıcılarını görüntüleyebilirsiniz'
    );
    expect(mockRepository.getCompanyUsers).not.toHaveBeenCalled();
  });

  it('should return error when company not found', async () => {
    const companyId = 'non-existent';
    const userId = 'admin-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(companyId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bulunamadı');
    expect(mockRepository.getCompanyUsers).not.toHaveBeenCalled();
  });

  it('should return error for unauthorized role', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    // COMPANY_USER without userCompanyId should get authorization error
    // But since COMPANY_USER is handled in the same branch as COMPANY_ADMIN,
    // it will check userCompanyId first, which is undefined, so it will return
    // "Sadece kendi firmanızın kullanıcılarını görüntüleyebilirsiniz"
    const result = await useCase.execute(companyId, userId, UserRole.COMPANY_USER);

    expect(result.isFailure).toBe(true);
    // COMPANY_USER without userCompanyId will get the same error as COMPANY_ADMIN
    expect(result.error?.message || result.error).toContain(
      'Sadece kendi firmanızın kullanıcılarını görüntüleyebilirsiniz'
    );
    expect(mockRepository.getCompanyUsers).not.toHaveBeenCalled();
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
