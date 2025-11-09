/**
 * Availability Entity
 * Danışman müsaitlik kuralları için domain entity
 */

export interface Availability {
  id: string;
  consultantId: string;
  dayOfWeek: number; // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  startTime: string; // HH:mm format (örn: "09:00")
  endTime: string; // HH:mm format (örn: "17:00")
  validFrom?: Date | null;
  validUntil?: Date | null;
  programId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateAvailabilityDto {
  consultantId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom?: Date | null;
  validUntil?: Date | null;
  programId?: string | null;
}

export interface UpdateAvailabilityDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  validFrom?: Date | null;
  validUntil?: Date | null;
  programId?: string | null;
  isActive?: boolean;
}
