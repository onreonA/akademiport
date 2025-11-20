/**
 * Unit Tests for AssignManagerUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignManagerUseCase } from './AssignManagerUseCase';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { Program } from '@/3-domain/entities/Program';
import { UserRole } from '@/3-domain/enums/UserRole';
import { ProgramStatus } from '@/3-domain/enums/ProgramStatus';
import { Result } from '@/core/result/Result';

describe('AssignManagerUseCase', () => {
  let mockRepository: IProgramRepository;
  let useCase: AssignManagerUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByManagerId: vi.fn(),
      findByStatus: vi.fn(),
      findByCity: vi.fn(),
      search: vi.fn(),
      addConsultant: vi.fn(),
      removeConsultant: vi.fn(),
      getConsultants: vi.fn(),
    };

    useCase = new AssignManagerUseCase(mockRepository);
  });

  const createMockProgram = (overrides?: Partial<Program>): Program => {
    return {
      id: 'program-1',
      name: 'Test Program',
      description: 'Test Description',
      slug: 'test-program',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      durationMonths: 12,
      maxCompanies: 20,
      currentCompanies: 0,
      status: ProgramStatus.PLANNED,
      programManagerId: 'manager-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should assign manager successfully for MASTER_ADMIN', async () => {
    const programId = 'program-1';
    const managerId = 'manager-2';
    const userId = 'admin-1';
    const input = {
      programId,
      managerId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const existingProgram = createMockProgram({ id: programId, programManagerId: 'manager-1' });
    const updatedProgram = createMockProgram({ id: programId, programManagerId: managerId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedProgram));

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedProgram);
    expect(mockRepository.findById).toHaveBeenCalledWith(programId);
    expect(mockRepository.update).toHaveBeenCalledWith(programId, {
      programManagerId: managerId,
    });
  });

  it('should return error when user is not MASTER_ADMIN', async () => {
    const programId = 'program-1';
    const managerId = 'manager-2';
    const userId = 'manager-1';
    const input = {
      programId,
      managerId,
      userId,
      userRole: UserRole.PROGRAM_MANAGER,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Sadece Master Admin program yöneticisi atayabilir'
    );
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when program ID is empty', async () => {
    const managerId = 'manager-2';
    const userId = 'admin-1';
    const input = {
      programId: '',
      managerId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program ID zorunludur');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when manager ID is empty', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const input = {
      programId,
      managerId: '',
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Yönetici ID zorunludur');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when program not found', async () => {
    const programId = 'non-existent';
    const managerId = 'manager-2';
    const userId = 'admin-1';
    const input = {
      programId,
      managerId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program bulunamadı');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const programId = 'program-1';
    const managerId = 'manager-2';
    const userId = 'admin-1';
    const input = {
      programId,
      managerId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle update errors', async () => {
    const programId = 'program-1';
    const managerId = 'manager-2';
    const userId = 'admin-1';
    const input = {
      programId,
      managerId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const existingProgram = createMockProgram({ id: programId });
    const errorMessage = 'Update failed';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const programId = 'program-1';
    const managerId = 'manager-2';
    const userId = 'admin-1';
    const input = {
      programId,
      managerId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
