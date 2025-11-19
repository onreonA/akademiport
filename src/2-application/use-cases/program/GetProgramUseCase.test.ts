/**
 * Unit Tests for GetProgramUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetProgramUseCase } from './GetProgramUseCase';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { Program } from '@/3-domain/entities/Program';
import { Result } from '@/core/result/Result';

describe('GetProgramUseCase', () => {
  let mockRepository: IProgramRepository;
  let useCase: GetProgramUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByManagerId: vi.fn(),
      findByConsultantId: vi.fn(),
    };

    useCase = new GetProgramUseCase(mockRepository);
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

  it('should get program successfully', async () => {
    const programId = 'program-1';
    const mockProgram = createMockProgram({ id: programId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockProgram));

    const result = await useCase.execute({ id: programId });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockProgram);
    expect(mockRepository.findById).toHaveBeenCalledWith(programId);
  });

  it('should return error when program ID is empty', async () => {
    const result = await useCase.execute({ id: '' });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program ID zorunludur');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when program ID is whitespace', async () => {
    const result = await useCase.execute({ id: '   ' });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program ID zorunludur');
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when program not found', async () => {
    const programId = 'non-existent';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute({ id: programId });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program bulunamadı');
  });

  it('should return error when repository fails', async () => {
    const programId = 'program-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute({ id: programId });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const programId = 'program-1';
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute({ id: programId });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
