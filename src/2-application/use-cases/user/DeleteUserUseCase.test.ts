/**
 * Unit Tests for DeleteUserUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteUserUseCase } from './DeleteUserUseCase';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('DeleteUserUseCase', () => {
  let mockRepository: IUserRepository;
  let useCase: DeleteUserUseCase;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findByRole: vi.fn(),
      findByCompanyId: vi.fn(),
      findByProgramId: vi.fn(),
      search: vi.fn(),
      findWithFilters: vi.fn(),
      assignProgram: vi.fn(),
      removeProgram: vi.fn(),
      getPrograms: vi.fn(),
      isProgramAssigned: vi.fn(),
      changePassword: vi.fn(),
      activate: vi.fn(),
      deactivate: vi.fn(),
      countByRole: vi.fn(),
      countByCompany: vi.fn(),
      countByProgram: vi.fn(),
    };

    useCase = new DeleteUserUseCase(mockRepository);
  });

  const createMockUser = (overrides?: Partial<User>): User => {
    return {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      role: UserRole.COMPANY_USER,
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should delete user successfully for MASTER_ADMIN', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
    };
    const mockUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockUser));
    vi.mocked(mockRepository.delete).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockRepository.delete).toHaveBeenCalledWith(userId);
  });

  it('should return error when user is not MASTER_ADMIN', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'user-2',
      userRole: UserRole.COMPANY_USER,
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.findById).not.toHaveBeenCalled();
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
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should return error when trying to delete self', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const mockUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Kendi hesabınızı silemezsiniz');
    expect(mockRepository.delete).not.toHaveBeenCalled();
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
