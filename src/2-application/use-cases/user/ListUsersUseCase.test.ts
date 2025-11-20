/**
 * Unit Tests for ListUsersUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListUsersUseCase } from './ListUsersUseCase';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('ListUsersUseCase', () => {
  let mockRepository: IUserRepository;
  let useCase: ListUsersUseCase;

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

    useCase = new ListUsersUseCase(mockRepository);
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

  const createMockResponse = (users: User[], total: number, page: number, limit: number) => ({
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });

  it('should list users successfully for MASTER_ADMIN', async () => {
    const request = {
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      page: 1,
      limit: 10,
    };
    const mockUsers = [createMockUser({ id: 'user-1' }), createMockUser({ id: 'user-2' })];
    const mockResponse = createMockResponse(mockUsers, 2, 1, 10);

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(Result.ok(mockResponse));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockResponse);
    expect(mockRepository.findWithFilters).toHaveBeenCalled();
  });

  it('should list users successfully for PROGRAM_MANAGER', async () => {
    const request = {
      userId: 'manager-1',
      userRole: UserRole.PROGRAM_MANAGER,
      page: 1,
      limit: 10,
    };
    const mockUsers = [createMockUser({ id: 'user-1' })];
    const mockResponse = createMockResponse(mockUsers, 1, 1, 10);

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(Result.ok(mockResponse));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockResponse);
  });

  it('should return error when user is not authorized', async () => {
    const request = {
      userId: 'user-1',
      userRole: UserRole.COMPANY_USER,
      page: 1,
      limit: 10,
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.findWithFilters).not.toHaveBeenCalled();
  });

  it('should apply filters correctly', async () => {
    const request = {
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      role: UserRole.COMPANY_USER,
      companyId: 'company-1',
      isActive: true,
      search: 'test',
      page: 1,
      limit: 10,
    };
    const mockUsers = [createMockUser({ id: 'user-1' })];
    const mockResponse = createMockResponse(mockUsers, 1, 1, 10);

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(Result.ok(mockResponse));

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findWithFilters).toHaveBeenCalledWith({
      role: UserRole.COMPANY_USER,
      companyId: 'company-1',
      isActive: true,
      search: 'test',
      page: 1,
      limit: 10,
      sortBy: undefined,
      sortOrder: undefined,
    });
  });

  it('should handle repository errors', async () => {
    const request = {
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      page: 1,
      limit: 10,
    };
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const request = {
      userId: 'admin-1',
      userRole: UserRole.MASTER_ADMIN,
      page: 1,
      limit: 10,
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findWithFilters).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
