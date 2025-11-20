/**
 * Unit Tests for CreateCompanyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateCompanyUseCase } from './CreateCompanyUseCase';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Company } from '@/3-domain/entities/Company';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/6-core/result/Result';

describe('CreateCompanyUseCase', () => {
  let mockRepository: ICompanyRepository;
  let useCase: CreateCompanyUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByProgramId: vi.fn(),
      findByCity: vi.fn(),
      search: vi.fn(),
      findWithFilters: vi.fn(),
      getCompanyUsers: vi.fn(),
      addCompanyUser: vi.fn(),
      removeCompanyUser: vi.fn(),
    } as any;

    useCase = new CreateCompanyUseCase(mockRepository);
  });

  const createValidDto = () => ({
    name: 'Test Company',
    programId: 'program-1',
    country: 'Turkey',
    maxUsers: 2,
    taxNumber: '1234567890',
    email: 'test@company.com',
    phone: '+905551234567',
    address: 'Test Address',
    city: 'Istanbul',
  });

  const createMockCompany = (overrides?: Partial<Company>): Company => {
    return {
      id: 'company-1',
      name: 'Test Company',
      slug: 'test-company',
      country: 'Turkey',
      taxNumber: '1234567890',
      email: 'test@company.com',
      phone: '+905551234567',
      address: 'Test Address',
      city: 'Istanbul',
      isActive: true,
      programId: 'program-1',
      maxUsers: 2,
      currentUsers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should create company successfully for MASTER_ADMIN', async () => {
    const userId = 'admin-1';
    const dto = createValidDto();
    const mockCompany = createMockCompany();

    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(dto, userId, UserRole.MASTER_ADMIN);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockCompany);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should create company successfully for PROGRAM_MANAGER', async () => {
    const userId = 'manager-1';
    const dto = createValidDto();
    const mockCompany = createMockCompany();

    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockCompany));

    const result = await useCase.execute(dto, userId, UserRole.PROGRAM_MANAGER);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockCompany);
  });

  it('should return error when COMPANY_ADMIN tries to create company', async () => {
    const userId = 'user-1';
    const dto = createValidDto();

    const result = await useCase.execute(dto, userId, UserRole.COMPANY_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when CONSULTANT tries to create company', async () => {
    const userId = 'consultant-1';
    const dto = createValidDto();

    const result = await useCase.execute(dto, userId, UserRole.CONSULTANT);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu işlem için yetkiniz yok');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const userId = 'admin-1';
    const dto = createValidDto();
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.create).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(dto, userId, UserRole.MASTER_ADMIN);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
