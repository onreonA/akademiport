/**
 * Unit Tests for CheckAvailabilityUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckAvailabilityUseCase } from './CheckAvailabilityUseCase';
import type { IAvailabilityRepository } from '@/3-domain/repositories/IAvailabilityRepository';
import { Result } from '@/6-core/result/Result';

describe('CheckAvailabilityUseCase', () => {
  let mockRepository: IAvailabilityRepository;
  let useCase: CheckAvailabilityUseCase;

  beforeEach(() => {
    mockRepository = {
      checkAvailability: vi.fn(),
    };

    useCase = new CheckAvailabilityUseCase(mockRepository);
  });

  it('should check availability successfully', async () => {
    const input = {
      consultantId: 'consultant-1',
      startTime: new Date('2025-01-15T10:00:00Z'),
      endTime: new Date('2025-01-15T11:00:00Z'),
      programId: 'program-1',
    };
    const mockResult = {
      isAvailable: true,
      conflicts: [],
    };

    vi.mocked(mockRepository.checkAvailability).mockResolvedValue(Result.ok(mockResult));

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockResult);
    expect(mockRepository.checkAvailability).toHaveBeenCalledWith(
      input.consultantId,
      input.startTime,
      input.endTime,
      input.programId
    );
  });

  it('should return conflicts when not available', async () => {
    const input = {
      consultantId: 'consultant-1',
      startTime: new Date('2025-01-15T10:00:00Z'),
      endTime: new Date('2025-01-15T11:00:00Z'),
    };
    const mockResult = {
      isAvailable: false,
      conflicts: [
        {
          type: 'appointment' as const,
          details: { appointmentId: 'appointment-1' },
        },
      ],
    };

    vi.mocked(mockRepository.checkAvailability).mockResolvedValue(Result.ok(mockResult));

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.isAvailable).toBe(false);
    expect(result.value?.conflicts).toHaveLength(1);
  });

  it('should fail when consultant ID is empty', async () => {
    const input = {
      consultantId: '',
      startTime: new Date('2025-01-15T10:00:00Z'),
      endTime: new Date('2025-01-15T11:00:00Z'),
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Danışman ID zorunludur');
    expect(mockRepository.checkAvailability).not.toHaveBeenCalled();
  });

  it('should fail when start time is missing', async () => {
    const input = {
      consultantId: 'consultant-1',
      startTime: undefined as any,
      endTime: new Date('2025-01-15T11:00:00Z'),
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Başlangıç ve bitiş tarihi zorunludur');
    expect(mockRepository.checkAvailability).not.toHaveBeenCalled();
  });

  it('should fail when end time is missing', async () => {
    const input = {
      consultantId: 'consultant-1',
      startTime: new Date('2025-01-15T10:00:00Z'),
      endTime: undefined as any,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain('Başlangıç ve bitiş tarihi zorunludur');
    expect(mockRepository.checkAvailability).not.toHaveBeenCalled();
  });

  it('should fail when end time is before start time', async () => {
    const input = {
      consultantId: 'consultant-1',
      startTime: new Date('2025-01-15T11:00:00Z'),
      endTime: new Date('2025-01-15T10:00:00Z'),
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
    );
    expect(mockRepository.checkAvailability).not.toHaveBeenCalled();
  });

  it('should fail when end time equals start time', async () => {
    const startTime = new Date('2025-01-15T10:00:00Z');
    const input = {
      consultantId: 'consultant-1',
      startTime,
      endTime: startTime,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toContain(
      'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
    );
    expect(mockRepository.checkAvailability).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const input = {
      consultantId: 'consultant-1',
      startTime: new Date('2025-01-15T10:00:00Z'),
      endTime: new Date('2025-01-15T11:00:00Z'),
    };
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.checkAvailability).mockResolvedValue(Result.fail(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const input = {
      consultantId: 'consultant-1',
      startTime: new Date('2025-01-15T10:00:00Z'),
      endTime: new Date('2025-01-15T11:00:00Z'),
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.checkAvailability).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
