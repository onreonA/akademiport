/**
 * Manage Availability Use Case
 * Müsaitlik kuralları yönetimi için use case
 */

import { Result } from '@/core/result/Result';
import type { IAvailabilityRepository } from '@/domain/repositories/IAvailabilityRepository';
import type {
  Availability,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
} from '@/domain/entities/Availability';

export class ManageAvailabilityUseCase {
  constructor(private readonly availabilityRepository: IAvailabilityRepository) {}

  async createAvailability(data: CreateAvailabilityDto): Promise<Result<Availability>> {
    try {
      // Validation
      if (!data.consultantId || data.consultantId.trim().length === 0) {
        return Result.fail('Danışman ID zorunludur');
      }

      if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
        return Result.fail('Geçerli bir hafta günü seçiniz (0-6)');
      }

      if (!data.startTime || !data.endTime) {
        return Result.fail('Başlangıç ve bitiş saati zorunludur');
      }

      // Time validation
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);

      if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        return Result.fail('Geçerli bir saat formatı giriniz (HH:mm)');
      }

      if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59) {
        return Result.fail('Geçerli bir başlangıç saati giriniz');
      }

      if (endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
        return Result.fail('Geçerli bir bitiş saati giriniz');
      }

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (endMinutes <= startMinutes) {
        return Result.fail('Bitiş saati başlangıç saatinden sonra olmalıdır');
      }

      // Date range validation
      if (data.validFrom && data.validUntil) {
        if (new Date(data.validUntil) < new Date(data.validFrom)) {
          return Result.fail('Geçerli bitiş tarihi başlangıç tarihinden sonra olmalıdır');
        }
      }

      return await this.availabilityRepository.createAvailability(data);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsaitlik kuralı oluşturulamadı'
      );
    }
  }

  async updateAvailability(id: string, data: UpdateAvailabilityDto): Promise<Result<Availability>> {
    try {
      // Validation
      if (data.dayOfWeek !== undefined && (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
        return Result.fail('Geçerli bir hafta günü seçiniz (0-6)');
      }

      if (data.startTime && data.endTime) {
        const [startHour, startMinute] = data.startTime.split(':').map(Number);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);

        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
          return Result.fail('Geçerli bir saat formatı giriniz (HH:mm)');
        }

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (endMinutes <= startMinutes) {
          return Result.fail('Bitiş saati başlangıç saatinden sonra olmalıdır');
        }
      }

      if (data.validFrom && data.validUntil) {
        if (new Date(data.validUntil) < new Date(data.validFrom)) {
          return Result.fail('Geçerli bitiş tarihi başlangıç tarihinden sonra olmalıdır');
        }
      }

      return await this.availabilityRepository.updateAvailability(id, data);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsaitlik kuralı güncellenemedi'
      );
    }
  }

  async deleteAvailability(id: string): Promise<Result<void>> {
    try {
      return await this.availabilityRepository.deleteAvailability(id);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Müsaitlik kuralı silinemedi');
    }
  }

  async getAvailabilityByConsultant(
    consultantId: string,
    programId?: string | null
  ): Promise<Result<Availability[]>> {
    try {
      if (!consultantId || consultantId.trim().length === 0) {
        return Result.fail('Danışman ID zorunludur');
      }

      return await this.availabilityRepository.findAvailabilityByConsultant(
        consultantId,
        programId
      );
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsaitlik kuralları getirilemedi'
      );
    }
  }
}
