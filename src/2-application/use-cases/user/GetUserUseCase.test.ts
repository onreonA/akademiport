/**
 * Unit Tests for GetUserUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetUserUseCase } from './GetUserUseCase';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('GetUserUseCase', () => {
  let mockRepository: IUserRepository;
  let useCase: GetUserUseCase;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findWithFilters: vi.fn(),
    };

    useCase = new GetUserUseCase(mockRepository);
  });

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

  it('should get user successfully for MASTER_ADMIN', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
    };
    const mockUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockUser);
    expect(mockRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should get user successfully for self', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId,
      userRole: UserRole.COMPANY_USER,
    };
    const mockUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockUser);
  });

  it('should get user successfully for COMPANY_ADMIN viewing same company user', async () => {
    const userId = 'user-1';
    const adminId = 'admin-1';
    const companyId = 'company-1';
    const request = {
      id: userId,
      userId: adminId,
      userRole: UserRole.COMPANY_ADMIN,
    };
    const mockUser = createMockUser({ id: userId, companyId });
    const adminUser = createMockUser({ id: adminId, companyId, role: UserRole.COMPANY_ADMIN });

    vi.mocked(mockRepository.findById)
      .mockResolvedValueOnce(Result.ok(mockUser))
      .mockResolvedValueOnce(Result.ok(adminUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockUser);
  });

  it('should return error when user not found', async () => {
    const userId = 'non-existent';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Kullanıcı bulunamadı');
  });

  it('should return error when unauthorized user tries to view', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'user-2',
      userRole: UserRole.COMPANY_USER,
    };
    const mockUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Bu kullanıcıyı görüntüleme yetkiniz yok'
    );
  });

  it('should return error when COMPANY_ADMIN tries to view different company user', async () => {
    const userId = 'user-1';
    const adminId = 'admin-1';
    const request = {
      id: userId,
      userId: adminId,
      userRole: UserRole.COMPANY_ADMIN,
    };
    const mockUser = createMockUser({ id: userId, companyId: 'company-1' });
    const adminUser = createMockUser({
      id: adminId,
      companyId: 'company-2',
      role: UserRole.COMPANY_ADMIN,
    });

    vi.mocked(mockRepository.findById)
      .mockResolvedValueOnce(Result.ok(mockUser))
      .mockResolvedValueOnce(Result.ok(adminUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Bu kullanıcıyı görüntüleme yetkiniz yok'
    );
  });

  it('should handle repository errors', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
    };
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
