/**
 * Update Program DTO
 *
 * Data Transfer Object for updating an existing program
 */

import { ProgramStatus } from '@/domain/enums/ProgramStatus';

export interface UpdateProgramDto {
  name?: string;
  description?: string;
  city?: string;
  region?: string;
  programType?: string;
  startDate?: Date;
  endDate?: Date;
  durationMonths?: number;
  maxCompanies?: number;
  status?: ProgramStatus;
  sponsor?: string;
  budget?: number;
  programManagerId?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateProgramRequest {
  name?: string;
  description?: string;
  city?: string;
  region?: string;
  programType?: string;
  startDate?: string; // ISO string from frontend
  endDate?: string; // ISO string from frontend
  durationMonths?: number;
  maxCompanies?: number;
  status?: ProgramStatus;
  sponsor?: string;
  budget?: number;
  programManagerId?: string;
  settings?: Record<string, unknown>;
}

/**
 * Validation rules for UpdateProgramDto
 */
export const UpdateProgramDtoValidation = {
  name: {
    minLength: 3,
    maxLength: 100,
  },
  description: {
    maxLength: 1000,
  },
  maxCompanies: {
    min: 1,
    max: 1000,
  },
  budget: {
    min: 0,
  },
} as const;
