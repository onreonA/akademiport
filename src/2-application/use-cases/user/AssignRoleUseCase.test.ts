/**
 * Unit Tests for AssignRoleUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignRoleUseCase } from './AssignRoleUseCase';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

// Mock canAssignRole function
vi.mock('@/application/dto/user', () => ({
  canAssignRole: vi.fn(),
}));

describe('AssignRoleUseCase', () => {
  let mockRepository: IUserRepository;
  let useCase: AssignRoleUseCase;

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

    useCase = new AssignRoleUseCase(mockRepository);
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

  it('should assign role successfully', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      newRole: UserRole.COMPANY_ADMIN,
      assignedBy: 'admin-1',
      assignerRole: UserRole.MASTER_ADMIN,
    };
    const existingUser = createMockUser({ id: userId });
    const updatedUser = createMockUser({ id: userId, role: UserRole.COMPANY_ADMIN });

    const { canAssignRole } = await import('@/application/dto/user');
    vi.mocked(canAssignRole).mockReturnValue({ allowed: true });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedUser);
    expect(mockRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockRepository.update).toHaveBeenCalledWith(userId, {
      role: UserRole.COMPANY_ADMIN,
      updatedBy: 'admin-1',
    });
  });

  it('should return error when user not found', async () => {
    const userId = 'non-existent';
    const request = {
      userId,
      newRole: UserRole.COMPANY_ADMIN,
      assignedBy: 'admin-1',
      assignerRole: UserRole.MASTER_ADMIN,
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Kullanıcı bulunamadı');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when role assignment is not allowed', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      newRole: UserRole.MASTER_ADMIN,
      assignedBy: 'manager-1',
      assignerRole: UserRole.PROGRAM_MANAGER,
    };
    const existingUser = createMockUser({ id: userId });

    const { canAssignRole } = await import('@/application/dto/user');
    vi.mocked(canAssignRole).mockReturnValue({
      allowed: false,
      reason: 'Program Manager bu rolü atayamaz',
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program Manager bu rolü atayamaz');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when trying to assign role to self', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      newRole: UserRole.COMPANY_ADMIN,
      assignedBy: userId,
      assignerRole: UserRole.COMPANY_USER,
    };
    const existingUser = createMockUser({ id: userId });

    const { canAssignRole } = await import('@/application/dto/user');
    vi.mocked(canAssignRole).mockReturnValue({ allowed: true });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Kendi rolünüzü değiştiremezsiniz');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should allow MASTER_ADMIN to assign role to self', async () => {
    const userId = 'admin-1';
    const request = {
      userId,
      newRole: UserRole.COMPANY_ADMIN,
      assignedBy: userId,
      assignerRole: UserRole.MASTER_ADMIN,
    };
    const existingUser = createMockUser({ id: userId, role: UserRole.MASTER_ADMIN });
    const updatedUser = createMockUser({ id: userId, role: UserRole.COMPANY_ADMIN });

    const { canAssignRole } = await import('@/application/dto/user');
    vi.mocked(canAssignRole).mockReturnValue({ allowed: true });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingUser));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      newRole: UserRole.COMPANY_ADMIN,
      assignedBy: 'admin-1',
      assignerRole: UserRole.MASTER_ADMIN,
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
      userId,
      newRole: UserRole.COMPANY_ADMIN,
      assignedBy: 'admin-1',
      assignerRole: UserRole.MASTER_ADMIN,
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
