/**
 * Unit Tests for RemoveCompanyUserUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RemoveCompanyUserUseCase } from './RemoveCompanyUserUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/6-core/result';
import { Company } from '@/3-domain/entities/Company';

describe('RemoveCompanyUserUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: RemoveCompanyUserUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByProgramId: vi.fn(),
      removeCompanyUser: vi.fn(),
    };

    useCase = new RemoveCompanyUserUseCase(mockRepository);
  });

  const createMockCompany = (overrides?: Partial<Company>): Company => {
    return {
      id: 'company-1',
      name: 'Test Company',
      programId: 'program-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should remove company user successfully as MASTER_ADMIN', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-2';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.removeCompanyUser).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.removeCompanyUser).toHaveBeenCalledWith(companyId, targetUserId);
  });

  it('should remove company user successfully as COMPANY_ADMIN from own company', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-2';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.removeCompanyUser).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(
      companyId,
      targetUserId,
      userId,
      UserRole.COMPANY_ADMIN,
      companyId
    );

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.removeCompanyUser).toHaveBeenCalledWith(companyId, targetUserId);
  });

  it('should fail when COMPANY_ADMIN tries to remove user from different company', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-2';
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
      'Sadece kendi firmanızdan kullanıcı çıkarabilirsiniz'
    );
    expect(mockRepository.removeCompanyUser).not.toHaveBeenCalled();
  });

  it('should fail when COMPANY_ADMIN tries to remove themselves', async () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(
      companyId,
      userId,
      userId,
      UserRole.COMPANY_ADMIN,
      companyId
    );

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Kendinizi çıkaramazsınız');
    expect(mockRepository.removeCompanyUser).not.toHaveBeenCalled();
  });

  it('should fail when unauthorized user tries to remove company user', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-2';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.COMPANY_USER);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.removeCompanyUser).not.toHaveBeenCalled();
  });

  it('should fail when company not found', async () => {
    const companyId = 'non-existent';
    const targetUserId = 'user-2';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Firma bulunamadı');
    expect(mockRepository.removeCompanyUser).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const companyId = 'company-1';
    const targetUserId = 'user-2';
    const userId = 'user-1';
    const mockCompany = createMockCompany({ id: companyId });
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockCompany));
    vi.mocked(mockRepository.removeCompanyUser).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(companyId, targetUserId, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
