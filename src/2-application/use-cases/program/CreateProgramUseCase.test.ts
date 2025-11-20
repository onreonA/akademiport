/**
 * Unit Tests for CreateProgramUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProgramUseCase } from './CreateProgramUseCase';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { Program } from '@/3-domain/entities/Program';
import { UserRole } from '@/3-domain/enums/UserRole';
import { ProgramStatus } from '@/3-domain/enums/ProgramStatus';
import { Result } from '@/core/result/Result';

describe('CreateProgramUseCase', () => {
  let mockRepository: IProgramRepository;
  let useCase: CreateProgramUseCase;

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
    } as any;

    useCase = new CreateProgramUseCase(mockRepository);
  });

  const createMockProgram = (overrides?: Partial<Program>): Program => {
    return {
      id: 'program-1',
      name: 'Test Program',
      description: 'Test Description',
      slug: 'test-program',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      maxCompanies: 10,
      currentCompanies: 0,
      status: ProgramStatus.ACTIVE,
      programManagerId: 'manager-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  const createValidInput = () => ({
    name: 'Test Program',
    description: 'Test Description',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    userRole: UserRole.MASTER_ADMIN,
  });

  it('should create program successfully', async () => {
    const input = createValidInput();
    const mockProgram = createMockProgram();

    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockProgram));

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockProgram);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should return error when user is not MASTER_ADMIN', async () => {
    const input = { ...createValidInput(), userRole: UserRole.PROGRAM_MANAGER };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Sadece Master Admin program oluşturabilir'
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when name is empty', async () => {
    const input = { ...createValidInput(), name: '' };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Program adı zorunludur');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when name is too short', async () => {
    const input = { ...createValidInput(), name: 'AB' };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('en az 3 karakter');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when name is too long', async () => {
    const input = { ...createValidInput(), name: 'A'.repeat(101) };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('en fazla 100 karakter');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when start date is missing', async () => {
    const input = { ...createValidInput(), startDate: undefined as any };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Başlangıç tarihi zorunludur');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when end date is missing', async () => {
    const input = { ...createValidInput(), endDate: undefined as any };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Bitiş tarihi zorunludur');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when end date is before start date', async () => {
    const input = {
      ...createValidInput(),
      startDate: new Date('2025-12-31'),
      endDate: new Date('2025-01-01'),
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should auto-generate slug when not provided', async () => {
    const input = createValidInput();
    const mockProgram = createMockProgram();

    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockProgram));

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    const createCall = vi.mocked(mockRepository.create).mock.calls[0][0];
    expect(createCall.slug).toBeDefined();
    expect(createCall.slug).toBe('test-program');
  });

  it('should set default status when not provided', async () => {
    const input = createValidInput();
    const mockProgram = createMockProgram();

    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockProgram));

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    const createCall = vi.mocked(mockRepository.create).mock.calls[0][0];
    expect(createCall.status).toBe(ProgramStatus.PLANNED);
  });

  it('should calculate duration when not provided', async () => {
    const input = createValidInput();
    const mockProgram = createMockProgram();

    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockProgram));

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    const createCall = vi.mocked(mockRepository.create).mock.calls[0][0];
    expect(createCall.durationMonths).toBeDefined();
    expect(createCall.durationMonths).toBeGreaterThan(0);
  });

  it('should handle repository errors', async () => {
    const input = createValidInput();
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.create).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const input = createValidInput();
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.create).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
