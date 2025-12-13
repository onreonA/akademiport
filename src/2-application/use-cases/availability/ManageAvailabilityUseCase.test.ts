/**
 * Unit Tests for ManageAvailabilityUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageAvailabilityUseCase } from './ManageAvailabilityUseCase';
import { Result } from '@/core/result/Result';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock repository
const mockAvailabilityRepository = {
  createAvailability: vi.fn(),
  updateAvailability: vi.fn(),
  deleteAvailability: vi.fn(),
  findAvailabilityByConsultant: vi.fn(),
};

describe('ManageAvailabilityUseCase', () => {
  let useCase: ManageAvailabilityUseCase;

  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new ManageAvailabilityUseCase(mockAvailabilityRepository as any);
  });

  describe('createAvailability', () => {
    const validDto = {
      consultantId: 'consultant-1',
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
    };

    it('should create availability successfully', async () => {
      const mockAvailability = {
        id: 'avail-1',
        ...validDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAvailabilityRepository.createAvailability.mockResolvedValue(Result.ok(mockAvailability));

      const result = await useCase.createAvailability(validDto);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.id).toBe('avail-1');
        expect(mockAvailabilityRepository.createAvailability).toHaveBeenCalledWith(validDto);
      }
    });

    it('should return error when consultantId is missing', async () => {
      const result = await useCase.createAvailability({
        ...validDto,
        consultantId: '',
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Danışman ID zorunludur');
      }
    });

    it('should return error when dayOfWeek is invalid', async () => {
      const result = await useCase.createAvailability({
        ...validDto,
        dayOfWeek: 7, // Invalid
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Geçerli bir hafta günü');
      }
    });

    it('should return error when startTime is missing', async () => {
      const result = await useCase.createAvailability({
        ...validDto,
        startTime: '',
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Başlangıç ve bitiş saati zorunludur');
      }
    });

    it('should return error when endTime is before startTime', async () => {
      const result = await useCase.createAvailability({
        ...validDto,
        startTime: '17:00',
        endTime: '09:00',
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Bitiş saati başlangıç saatinden sonra olmalıdır');
      }
    });

    it('should return error when validUntil is before validFrom', async () => {
      const result = await useCase.createAvailability({
        ...validDto,
        validFrom: new Date('2025-12-31'),
        validUntil: new Date('2025-01-01'),
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Geçerli bitiş tarihi');
      }
    });

    it('should handle repository errors', async () => {
      mockAvailabilityRepository.createAvailability.mockRejectedValue(new Error('Database error'));

      const result = await useCase.createAvailability(validDto);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('updateAvailability', () => {
    const id = 'avail-1';
    const validUpdateDto = {
      startTime: '10:00',
      endTime: '18:00',
    };

    it('should update availability successfully', async () => {
      const mockAvailability = {
        id,
        consultantId: 'consultant-1',
        dayOfWeek: 1,
        ...validUpdateDto,
        updatedAt: new Date(),
      };

      mockAvailabilityRepository.updateAvailability.mockResolvedValue(Result.ok(mockAvailability));

      const result = await useCase.updateAvailability(id, validUpdateDto);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.id).toBe(id);
        expect(mockAvailabilityRepository.updateAvailability).toHaveBeenCalledWith(
          id,
          validUpdateDto
        );
      }
    });

    it('should return error when dayOfWeek is invalid', async () => {
      const result = await useCase.updateAvailability(id, {
        dayOfWeek: 7,
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Geçerli bir hafta günü');
      }
    });

    it('should handle repository errors', async () => {
      mockAvailabilityRepository.updateAvailability.mockRejectedValue(new Error('Database error'));

      const result = await useCase.updateAvailability(id, validUpdateDto);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('deleteAvailability', () => {
    const id = 'avail-1';

    it('should delete availability successfully', async () => {
      mockAvailabilityRepository.deleteAvailability.mockResolvedValue(Result.ok(undefined));

      const result = await useCase.deleteAvailability(id);

      expect(result.isSuccess).toBe(true);
      expect(mockAvailabilityRepository.deleteAvailability).toHaveBeenCalledWith(id);
    });

    it('should handle repository errors', async () => {
      mockAvailabilityRepository.deleteAvailability.mockRejectedValue(new Error('Database error'));

      const result = await useCase.deleteAvailability(id);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('getAvailabilityByConsultant', () => {
    const consultantId = 'consultant-1';

    it('should return availability list successfully', async () => {
      const mockAvailabilities = [
        {
          id: 'avail-1',
          consultantId,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        },
      ];

      mockAvailabilityRepository.findAvailabilityByConsultant.mockResolvedValue(
        Result.ok(mockAvailabilities)
      );

      const result = await useCase.getAvailabilityByConsultant(consultantId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].id).toBe('avail-1');
      }
    });

    it('should return error when consultantId is missing', async () => {
      const result = await useCase.getAvailabilityByConsultant('');

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Danışman ID zorunludur');
      }
    });

    it('should handle repository errors', async () => {
      mockAvailabilityRepository.findAvailabilityByConsultant.mockRejectedValue(
        new Error('Database error')
      );

      const result = await useCase.getAvailabilityByConsultant(consultantId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
