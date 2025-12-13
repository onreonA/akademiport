/**
 * Unit Tests for ManageUnavailableDatesUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageUnavailableDatesUseCase } from './ManageUnavailableDatesUseCase';
import { Result } from '@/core/result/Result';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock repository
const mockAvailabilityRepository = {
  createUnavailableDate: vi.fn(),
  updateUnavailableDate: vi.fn(),
  deleteUnavailableDate: vi.fn(),
  findUnavailableDatesByConsultant: vi.fn(),
};

describe('ManageUnavailableDatesUseCase', () => {
  let useCase: ManageUnavailableDatesUseCase;

  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new ManageUnavailableDatesUseCase(mockAvailabilityRepository as any);
  });

  describe('createUnavailableDate', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const futureEndDate = new Date(futureDate);
    futureEndDate.setDate(futureEndDate.getDate() + 1);

    const validDto = {
      consultantId: 'consultant-1',
      startTime: futureDate,
      endTime: futureEndDate,
    };

    it('should create unavailable date successfully', async () => {
      const mockUnavailableDate = {
        id: 'unavail-1',
        ...validDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAvailabilityRepository.createUnavailableDate.mockResolvedValue(
        Result.ok(mockUnavailableDate)
      );

      const result = await useCase.createUnavailableDate(validDto);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.id).toBe('unavail-1');
        expect(mockAvailabilityRepository.createUnavailableDate).toHaveBeenCalledWith(validDto);
      }
    });

    it('should return error when consultantId is missing', async () => {
      const result = await useCase.createUnavailableDate({
        ...validDto,
        consultantId: '',
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Danışman ID zorunludur');
      }
    });

    it('should return error when startTime is missing', async () => {
      const result = await useCase.createUnavailableDate({
        ...validDto,
        startTime: null as any,
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Başlangıç ve bitiş tarihi zorunludur');
      }
    });

    it('should return error when endTime is before startTime', async () => {
      const result = await useCase.createUnavailableDate({
        ...validDto,
        endTime: validDto.startTime,
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain(
          'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
        );
      }
    });

    it('should return error when startTime is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = await useCase.createUnavailableDate({
        ...validDto,
        startTime: pastDate,
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Geçmiş tarih için müsait olmama durumu eklenemez');
      }
    });

    it('should handle repository errors', async () => {
      mockAvailabilityRepository.createUnavailableDate.mockRejectedValue(
        new Error('Database error')
      );

      const result = await useCase.createUnavailableDate(validDto);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('updateUnavailableDate', () => {
    const id = 'unavail-1';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setDate(futureEndDate.getDate() + 1);

    const validUpdateDto = {
      startTime: futureDate,
      endTime: futureEndDate,
    };

    it('should update unavailable date successfully', async () => {
      const mockUnavailableDate = {
        id,
        consultantId: 'consultant-1',
        ...validUpdateDto,
        updatedAt: new Date(),
      };

      mockAvailabilityRepository.updateUnavailableDate.mockResolvedValue(
        Result.ok(mockUnavailableDate)
      );

      const result = await useCase.updateUnavailableDate(id, validUpdateDto);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.id).toBe(id);
        expect(mockAvailabilityRepository.updateUnavailableDate).toHaveBeenCalledWith(
          id,
          validUpdateDto
        );
      }
    });

    it('should return error when endTime is before startTime', async () => {
      const result = await useCase.updateUnavailableDate(id, {
        startTime: futureEndDate,
        endTime: futureDate,
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain(
          'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
        );
      }
    });

    it('should return error when startTime is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = await useCase.updateUnavailableDate(id, {
        startTime: pastDate,
        endTime: futureDate,
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain(
          'Geçmiş tarih için müsait olmama durumu güncellenemez'
        );
      }
    });

    it('should handle repository errors', async () => {
      mockAvailabilityRepository.updateUnavailableDate.mockRejectedValue(
        new Error('Database error')
      );

      const result = await useCase.updateUnavailableDate(id, validUpdateDto);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('deleteUnavailableDate', () => {
    const id = 'unavail-1';

    it('should delete unavailable date successfully', async () => {
      mockAvailabilityRepository.deleteUnavailableDate.mockResolvedValue(Result.ok(undefined));

      const result = await useCase.deleteUnavailableDate(id);

      expect(result.isSuccess).toBe(true);
      expect(mockAvailabilityRepository.deleteUnavailableDate).toHaveBeenCalledWith(id);
    });

    it('should handle repository errors', async () => {
      mockAvailabilityRepository.deleteUnavailableDate.mockRejectedValue(
        new Error('Database error')
      );

      const result = await useCase.deleteUnavailableDate(id);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('getUnavailableDatesByConsultant', () => {
    const consultantId = 'consultant-1';

    it('should return unavailable dates list successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureEndDate = new Date(futureDate);
      futureEndDate.setDate(futureEndDate.getDate() + 1);

      const mockUnavailableDates = [
        {
          id: 'unavail-1',
          consultantId,
          startTime: futureDate,
          endTime: futureEndDate,
        },
      ];

      mockAvailabilityRepository.findUnavailableDatesByConsultant.mockResolvedValue(
        Result.ok(mockUnavailableDates)
      );

      const result = await useCase.getUnavailableDatesByConsultant(consultantId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].id).toBe('unavail-1');
      }
    });

    it('should return error when consultantId is missing', async () => {
      const result = await useCase.getUnavailableDatesByConsultant('');

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error?.message).toContain('Danışman ID zorunludur');
      }
    });

    it('should handle repository errors', async () => {
      mockAvailabilityRepository.findUnavailableDatesByConsultant.mockRejectedValue(
        new Error('Database error')
      );

      const result = await useCase.getUnavailableDatesByConsultant(consultantId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
