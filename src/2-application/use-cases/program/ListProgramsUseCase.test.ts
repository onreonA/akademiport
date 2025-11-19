/**
 * Unit Tests for ListProgramsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListProgramsUseCase } from './ListProgramsUseCase';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { Program } from '@/3-domain/entities/Program';
import { UserRole } from '@/3-domain/enums/UserRole';
import { Result } from '@/core/result/Result';

describe('ListProgramsUseCase', () => {
  let mockRepository: IProgramRepository;
  let useCase: ListProgramsUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByManagerId: vi.fn(),
      findByConsultantId: vi.fn(),
      findByStatus: vi.fn(),
      findByCity: vi.fn(),
    };

    useCase = new ListProgramsUseCase(mockRepository);
  });

  const createMockProgram = (overrides?: Partial<Program>): Program => {
    return {
      id: 'program-1',
      name: 'Test Program',
      description: 'Test Description',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true,
      managerId: 'manager-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should list all programs successfully', async () => {
    const mockPrograms = [
      createMockProgram({ id: 'program-1' }),
      createMockProgram({ id: 'program-2' }),
    ];

    vi.mocked(mockRepository.findAll).mockResolvedValue(Result.ok(mockPrograms));

    const result = await useCase.execute({ userRole: UserRole.MASTER_ADMIN });

    expect(result.isSuccess).toBe(true);
    expect(result.value?.programs).toEqual(mockPrograms);
    expect(result.value?.total).toBe(2);
    expect(result.value?.page).toBe(1);
    expect(result.value?.limit).toBe(20);
  });

  it('should filter programs by PROGRAM_MANAGER', async () => {
    const userId = 'manager-1';
    const mockPrograms = [createMockProgram({ id: 'program-1', managerId: userId })];

    vi.mocked(mockRepository.findByManagerId).mockResolvedValue(Result.ok(mockPrograms));

    const result = await useCase.execute({
      userId,
      userRole: UserRole.PROGRAM_MANAGER,
    });

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findByManagerId).toHaveBeenCalledWith(userId);
    expect(result.value?.programs).toEqual(mockPrograms);
  });

  it('should filter programs by status', async () => {
    const mockPrograms = [createMockProgram({ id: 'program-1' })];

    vi.mocked(mockRepository.findByStatus).mockResolvedValue(Result.ok(mockPrograms));

    const result = await useCase.execute({
      userRole: UserRole.MASTER_ADMIN,
      status: 'active',
    });

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findByStatus).toHaveBeenCalledWith('active');
  });

  it('should filter programs by search term', async () => {
    const mockPrograms = [
      createMockProgram({ id: 'program-1', name: 'Test Program', description: 'Test Description' }),
      createMockProgram({
        id: 'program-2',
        name: 'Another Program',
        description: 'Different description',
      }),
    ];

    vi.mocked(mockRepository.findAll).mockResolvedValue(Result.ok(mockPrograms));

    const result = await useCase.execute({
      userRole: UserRole.MASTER_ADMIN,
      search: 'Test',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value?.programs).toHaveLength(1);
    expect(result.value?.programs[0].name).toBe('Test Program');
  });

  it('should paginate results correctly', async () => {
    const mockPrograms = Array.from({ length: 25 }, (_, i) =>
      createMockProgram({ id: `program-${i + 1}` })
    );

    vi.mocked(mockRepository.findAll).mockResolvedValue(Result.ok(mockPrograms));

    const result = await useCase.execute({
      userRole: UserRole.MASTER_ADMIN,
      page: 2,
      limit: 10,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value?.programs).toHaveLength(10);
    expect(result.value?.page).toBe(2);
    expect(result.value?.limit).toBe(10);
    expect(result.value?.totalPages).toBe(3);
  });

  it('should handle repository errors', async () => {
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findAll).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute({ userRole: UserRole.MASTER_ADMIN });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findAll).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute({ userRole: UserRole.MASTER_ADMIN });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
