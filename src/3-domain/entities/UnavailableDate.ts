/**
 * UnavailableDate Entity
 * Danışman müsait olmadığı tarih/saat aralıkları için domain entity
 */

export interface UnavailableDate {
  id: string;
  consultantId: string;
  startTime: Date;
  endTime: Date;
  reason?: string | null;
  notes?: string | null;
  programId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateUnavailableDateDto {
  consultantId: string;
  startTime: Date;
  endTime: Date;
  reason?: string | null;
  notes?: string | null;
  programId?: string | null;
}

export interface UpdateUnavailableDateDto {
  startTime?: Date;
  endTime?: Date;
  reason?: string | null;
  notes?: string | null;
  programId?: string | null;
}
