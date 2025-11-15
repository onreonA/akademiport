/**
 * Check Availability Use Case
 * Müsaitlik kontrolü için use case
 */

import { Result } from '@/core/result/Result';
import type { IAvailabilityRepository } from '@/3-domain/repositories/IAvailabilityRepository';

export interface CheckAvailabilityInput {
  consultantId: string;
  startTime: Date;
  endTime: Date;
  programId?: string | null;
}

export class CheckAvailabilityUseCase {
  constructor(private readonly availabilityRepository: IAvailabilityRepository) {}

  async execute(input: CheckAvailabilityInput): Promise<
    Result<{
      isAvailable: boolean;
      conflicts: Array<{
        type: 'appointment' | 'unavailable' | 'outside_hours';
        details: any;
      }>;
    }>
  > {
    try {
      // Validation
      if (!input.consultantId || input.consultantId.trim().length === 0) {
        return Result.fail('Danışman ID zorunludur');
      }

      if (!input.startTime || !input.endTime) {
        return Result.fail('Başlangıç ve bitiş tarihi zorunludur');
      }

      if (input.endTime <= input.startTime) {
        return Result.fail('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      }

      return await this.availabilityRepository.checkAvailability(
        input.consultantId,
        input.startTime,
        input.endTime,
        input.programId
      );
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Müsaitlik kontrolü yapılamadı');
    }
  }
}
