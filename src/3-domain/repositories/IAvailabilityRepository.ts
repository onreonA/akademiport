/**
 * Availability Repository Interface
 * Müsaitlik kuralları için repository interface
 */

import type { Result } from '@/6-core/result/Result';
import type {
  Availability,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
} from '@/3-domain/entities/Availability';
import type {
  UnavailableDate,
  CreateUnavailableDateDto,
  UpdateUnavailableDateDto,
} from '@/3-domain/entities/UnavailableDate';

export interface IAvailabilityRepository {
  // Availability CRUD
  createAvailability(data: CreateAvailabilityDto): Promise<Result<Availability>>;
  findAvailabilityById(id: string): Promise<Result<Availability | null>>;
  findAvailabilityByConsultant(
    consultantId: string,
    programId?: string | null
  ): Promise<Result<Availability[]>>;
  updateAvailability(id: string, data: UpdateAvailabilityDto): Promise<Result<Availability>>;
  deleteAvailability(id: string): Promise<Result<void>>;

  // UnavailableDate CRUD
  createUnavailableDate(data: CreateUnavailableDateDto): Promise<Result<UnavailableDate>>;
  findUnavailableDateById(id: string): Promise<Result<UnavailableDate | null>>;
  findUnavailableDatesByConsultant(
    consultantId: string,
    startDate?: Date,
    endDate?: Date,
    programId?: string | null
  ): Promise<Result<UnavailableDate[]>>;
  updateUnavailableDate(
    id: string,
    data: UpdateUnavailableDateDto
  ): Promise<Result<UnavailableDate>>;
  deleteUnavailableDate(id: string): Promise<Result<void>>;

  // Availability Check
  checkAvailability(
    consultantId: string,
    startTime: Date,
    endTime: Date,
    programId?: string | null
  ): Promise<
    Result<{
      isAvailable: boolean;
      conflicts: Array<{ type: 'appointment' | 'unavailable' | 'outside_hours'; details: any }>;
    }>
  >;
}
