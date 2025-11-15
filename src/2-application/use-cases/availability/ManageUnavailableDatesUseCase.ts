/**
 * Manage Unavailable Dates Use Case
 * Müsait olmayan tarihler yönetimi için use case
 */

import { Result } from '@/core/result/Result';
import type { IAvailabilityRepository } from '@/3-domain/repositories/IAvailabilityRepository';
import type {
  UnavailableDate,
  CreateUnavailableDateDto,
  UpdateUnavailableDateDto,
} from '@/3-domain/entities/UnavailableDate';

export class ManageUnavailableDatesUseCase {
  constructor(private readonly availabilityRepository: IAvailabilityRepository) {}

  async createUnavailableDate(data: CreateUnavailableDateDto): Promise<Result<UnavailableDate>> {
    try {
      // Validation
      if (!data.consultantId || data.consultantId.trim().length === 0) {
        return Result.fail('Danışman ID zorunludur');
      }

      if (!data.startTime || !data.endTime) {
        return Result.fail('Başlangıç ve bitiş tarihi zorunludur');
      }

      if (data.endTime <= data.startTime) {
        return Result.fail('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      }

      // Check if start time is in the past
      if (data.startTime < new Date()) {
        return Result.fail('Geçmiş tarih için müsait olmama durumu eklenemez');
      }

      return await this.availabilityRepository.createUnavailableDate(data);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarih oluşturulamadı'
      );
    }
  }

  async updateUnavailableDate(
    id: string,
    data: UpdateUnavailableDateDto
  ): Promise<Result<UnavailableDate>> {
    try {
      // Validation
      if (data.startTime && data.endTime) {
        if (data.endTime <= data.startTime) {
          return Result.fail('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
        }

        if (data.startTime < new Date()) {
          return Result.fail('Geçmiş tarih için müsait olmama durumu güncellenemez');
        }
      }

      return await this.availabilityRepository.updateUnavailableDate(id, data);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarih güncellenemedi'
      );
    }
  }

  async deleteUnavailableDate(id: string): Promise<Result<void>> {
    try {
      return await this.availabilityRepository.deleteUnavailableDate(id);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarih silinemedi'
      );
    }
  }

  async getUnavailableDatesByConsultant(
    consultantId: string,
    startDate?: Date,
    endDate?: Date,
    programId?: string | null
  ): Promise<Result<UnavailableDate[]>> {
    try {
      if (!consultantId || consultantId.trim().length === 0) {
        return Result.fail('Danışman ID zorunludur');
      }

      return await this.availabilityRepository.findUnavailableDatesByConsultant(
        consultantId,
        startDate,
        endDate,
        programId
      );
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarihler getirilemedi'
      );
    }
  }
}
