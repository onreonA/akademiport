/**
 * Unit Tests for CreateUserUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateUserUseCase } from './CreateUserUseCase';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('CreateUserUseCase', () => {
  let mockRepository: IUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };

    useCase = new CreateUserUseCase(mockRepository);
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

  const createValidRequest = () => ({
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password123',
    role: UserRole.COMPANY_USER,
    companyId: 'company-1',
    userRole: UserRole.MASTER_ADMIN,
  });

  it('should create user successfully for MASTER_ADMIN', async () => {
    const request = createValidRequest();
    const mockUser = createMockUser();

    vi.mocked(mockRepository.findByEmail).mockResolvedValue(Result.ok(null));
    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockUser));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockUser);
    expect(mockRepository.findByEmail).toHaveBeenCalledWith(request.email);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should return error when user is not authorized', async () => {
    const request = { ...createValidRequest(), userRole: UserRole.COMPANY_USER };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when PROGRAM_MANAGER tries to create MASTER_ADMIN', async () => {
    const request = {
      ...createValidRequest(),
      userRole: UserRole.PROGRAM_MANAGER,
      role: UserRole.MASTER_ADMIN,
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Program Manager bu role kullanıcı oluşturamaz'
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when CONSULTANT tries to create non-company user', async () => {
    const request = {
      ...createValidRequest(),
      userRole: UserRole.CONSULTANT,
      role: UserRole.PROGRAM_MANAGER,
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Danışman sadece firma kullanıcıları oluşturabilir'
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when email is empty', async () => {
    const request = { ...createValidRequest(), email: '' };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Email zorunludur');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when firstName is empty', async () => {
    const request = { ...createValidRequest(), firstName: '' };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Ad zorunludur');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when lastName is empty', async () => {
    const request = { ...createValidRequest(), lastName: '' };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Soyad zorunludur');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when firstName is too short', async () => {
    const request = { ...createValidRequest(), firstName: 'A' };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Ad 2-100 karakter arasında olmalıdır');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when email format is invalid', async () => {
    const request = { ...createValidRequest(), email: 'invalid-email' };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Geçersiz email formatı');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when email already exists', async () => {
    const request = createValidRequest();
    const existingUser = createMockUser();

    vi.mocked(mockRepository.findByEmail).mockResolvedValue(Result.ok(existingUser));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu email adresi zaten kullanılıyor');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when password is too short', async () => {
    const request = { ...createValidRequest(), password: 'short' };

    vi.mocked(mockRepository.findByEmail).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Şifre en az 8 karakter olmalıdır');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when company is missing for COMPANY_USER', async () => {
    const request = {
      ...createValidRequest(),
      role: UserRole.COMPANY_USER,
      companyId: undefined,
    };

    vi.mocked(mockRepository.findByEmail).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Firma kullanıcıları için firma seçimi zorunludur'
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const request = createValidRequest();
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findByEmail).mockResolvedValue(Result.ok(null));
    vi.mocked(mockRepository.create).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const request = createValidRequest();
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findByEmail).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
