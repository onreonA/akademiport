/**
 * Unit Tests for UpdateProgramUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateProgramUseCase } from './UpdateProgramUseCase';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { Program } from '@/3-domain/entities/Program';
import { UserRole } from '@/3-domain/enums/UserRole';
import { ProgramStatus } from '@/3-domain/enums/ProgramStatus';
import { Result } from '@/core/result/Result';

describe('UpdateProgramUseCase', () => {
  let mockRepository: IProgramRepository;
  let useCase: UpdateProgramUseCase;

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

    useCase = new UpdateProgramUseCase(mockRepository);
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

  it('should update program successfully for MASTER_ADMIN', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
      name: 'Updated Program Name',
    };
    const existingProgram = createMockProgram({ id: programId });
    const updatedProgram = createMockProgram({ id: programId, name: 'Updated Program Name' });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedProgram));

    const result = await useCase.execute(updateInput);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedProgram);
    expect(mockRepository.findById).toHaveBeenCalledWith(programId);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should update program successfully for PROGRAM_MANAGER managing the program', async () => {
    const programId = 'program-1';
    const userId = 'manager-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.PROGRAM_MANAGER,
      name: 'Updated Name',
    };
    const existingProgram = createMockProgram({ id: programId, programManagerId: userId });
    const updatedProgram = createMockProgram({
      id: programId,
      programManagerId: userId,
      name: 'Updated Name',
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedProgram));

    const result = await useCase.execute(updateInput);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedProgram);
  });

  it('should return error when PROGRAM_MANAGER tries to update another program', async () => {
    const programId = 'program-1';
    const userId = 'manager-2';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.PROGRAM_MANAGER,
      name: 'Updated Name',
    };
    const existingProgram = createMockProgram({ id: programId, programManagerId: 'manager-1' });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bu programı düzenleme yetkiniz yok');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when program not found', async () => {
    const programId = 'non-existent';
    const userId = 'admin-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
      name: 'Updated Name',
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program bulunamadı');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when name is empty', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
      name: '   ',
    };
    const existingProgram = createMockProgram({ id: programId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program adı boş olamaz');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when name is too short', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
      name: 'AB',
    };
    const existingProgram = createMockProgram({ id: programId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('en az 3 karakter');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when end date is before start date', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
      startDate: new Date('2025-12-31'),
      endDate: new Date('2025-01-01'),
    };
    const existingProgram = createMockProgram({ id: programId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when non-MASTER_ADMIN tries to change status', async () => {
    const programId = 'program-1';
    const userId = 'manager-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.PROGRAM_MANAGER,
      status: ProgramStatus.ACTIVE,
    };
    const existingProgram = createMockProgram({ id: programId, programManagerId: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    // Status change validation happens after authorization check
    // Since PROGRAM_MANAGER can edit their own program, we get status change error
    expect(result.error?.message || result.error).toContain(
      'Sadece Master Admin program durumunu değiştirebilir'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when non-MASTER_ADMIN tries to change manager', async () => {
    const programId = 'program-1';
    const userId = 'manager-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.PROGRAM_MANAGER, // Not MASTER_ADMIN
      programManagerId: 'manager-2',
    };
    const existingProgram = createMockProgram({ id: programId, programManagerId: userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    // Manager change validation happens after authorization check
    // Since PROGRAM_MANAGER can edit their own program, we get manager change error
    expect(result.error?.message || result.error).toContain(
      'Sadece Master Admin program yöneticisini değiştirebilir'
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
      name: 'Updated Name',
    };
    const existingProgram = createMockProgram({ id: programId });
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingProgram));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const programId = 'program-1';
    const userId = 'admin-1';
    const updateInput = {
      id: programId,
      userId,
      userRole: UserRole.MASTER_ADMIN,
      name: 'Updated Name',
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(updateInput);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
