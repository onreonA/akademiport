/**
 * Unit Tests for ChangePasswordUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangePasswordUseCase } from './ChangePasswordUseCase';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

// Mock validatePasswordStrength function
vi.mock('@/application/dto/user', () => ({
  validatePasswordStrength: vi.fn(),
}));

describe('ChangePasswordUseCase', () => {
  let mockRepository: IUserRepository;
  let useCase: ChangePasswordUseCase;

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

    useCase = new ChangePasswordUseCase(mockRepository);
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

  it('should validate password change successfully', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    };
    const mockUser = createMockUser({ id: userId });

    const { validatePasswordStrength } = await import('@/application/dto/user');
    vi.mocked(validatePasswordStrength).mockReturnValue({ isValid: true, errors: [] });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should return error when old password is missing', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      oldPassword: '',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Tüm alanlar zorunludur');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when new password is missing', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      oldPassword: 'oldpassword123',
      newPassword: '',
      confirmPassword: 'newpassword123',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Tüm alanlar zorunludur');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when passwords do not match', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'differentpassword',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Yeni şifreler eşleşmiyor');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when new password is same as old password', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      oldPassword: 'password123',
      newPassword: 'password123',
      confirmPassword: 'password123',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Yeni şifre eski şifre ile aynı olamaz'
    );
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when password strength is invalid', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      oldPassword: 'oldpassword123',
      newPassword: 'weak',
      confirmPassword: 'weak',
    };

    const { validatePasswordStrength } = await import('@/application/dto/user');
    vi.mocked(validatePasswordStrength).mockReturnValue({
      isValid: false,
      errors: ['Şifre en az 8 karakter olmalıdır'],
    });

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Şifre en az 8 karakter olmalıdır');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when user not found', async () => {
    const userId = 'non-existent';
    const request = {
      userId,
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    };

    const { validatePasswordStrength } = await import('@/application/dto/user');
    vi.mocked(validatePasswordStrength).mockReturnValue({ isValid: true, errors: [] });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Kullanıcı bulunamadı');
  });

  it('should handle repository errors', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    };
    const errorMessage = 'Database error';

    const { validatePasswordStrength } = await import('@/application/dto/user');
    vi.mocked(validatePasswordStrength).mockReturnValue({ isValid: true, errors: [] });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const request = {
      userId,
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    };
    const errorMessage = 'Unexpected error';

    const { validatePasswordStrength } = await import('@/application/dto/user');
    vi.mocked(validatePasswordStrength).mockReturnValue({ isValid: true, errors: [] });

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
