/**
 * Unit Tests for UpdateUserUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateUserUseCase } from './UpdateUserUseCase';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('UpdateUserUseCase', () => {
  let mockRepository: IUserRepository;
  let useCase: UpdateUserUseCase;

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

    useCase = new UpdateUserUseCase(mockRepository);
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

  it('should update user successfully for MASTER_ADMIN', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      fullName: 'Updated Name',
    };
    const existingUser = createMockUser({ id: userId });
    const updatedUser = createMockUser({ id: userId, fullName: 'Updated Name' });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedUser);
    expect(mockRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should update user successfully for self', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId,
      userRole: UserRole.COMPANY_USER,
      fullName: 'Updated Name',
    };
    const existingUser = createMockUser({ id: userId });
    const updatedUser = createMockUser({ id: userId, fullName: 'Updated Name' });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedUser);
  });

  it('should return error when user not found', async () => {
    const userId = 'non-existent';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      fullName: 'Updated Name',
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Kullanıcı bulunamadı');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when unauthorized user tries to update', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'user-2',
      userRole: UserRole.COMPANY_USER,
      fullName: 'Updated Name',
    };
    const existingUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when self tries to change role', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId,
      userRole: UserRole.COMPANY_USER,
      role: UserRole.COMPANY_ADMIN,
    };
    const existingUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Kendi rolünüzü veya aktiflik durumunuzu değiştiremezsiniz'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when PROGRAM_MANAGER tries to update MASTER_ADMIN', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'manager-1',
      userRole: UserRole.PROGRAM_MANAGER,
      fullName: 'Updated Name',
    };
    const existingUser = createMockUser({ id: userId, role: UserRole.MASTER_ADMIN });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Program Manager bu kullanıcıyı güncelleyemez'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when PROGRAM_MANAGER tries to assign MASTER_ADMIN role', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'manager-1',
      userRole: UserRole.PROGRAM_MANAGER,
      role: UserRole.MASTER_ADMIN,
    };
    const existingUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program Manager bu rolleri atayamaz');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when fullName is too short', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      fullName: 'A',
    };
    const existingUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Ad Soyad 2-100 karakter arasında olmalıdır'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when bio is too long', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      bio: 'A'.repeat(501),
    };
    const existingUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Biyografi en fazla 500 karakter olabilir'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when expertiseAreas exceeds limit', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      expertiseAreas: Array(11).fill('Expertise'),
    };
    const existingUser = createMockUser({ id: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'En fazla 10 uzmanlık alanı eklenebilir'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const userId = 'user-1';
    const request = {
      id: userId,
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      fullName: 'Updated Name',
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
      fullName: 'Updated Name',
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
