/**
 * Create Program DTO
 *
 * Data Transfer Object for creating a new program
 */

import { ProgramStatus } from '@/domain/enums/ProgramStatus';

export interface CreateProgramDto {
  name: string;
  description?: string;
  slug?: string;
  city?: string;
  region?: string;
  programType?: string;
  startDate: Date;
  endDate: Date;
  durationMonths?: number;
  maxCompanies?: number;
  sponsor?: string;
  budget?: number;
  programManagerId?: string;
  status?: ProgramStatus;
}

export interface CreateProgramRequest {
  name: string;
  description?: string;
  city?: string;
  region?: string;
  programType?: string;
  startDate: string; // ISO string from frontend
  endDate: string; // ISO string from frontend
  durationMonths?: number;
  maxCompanies?: number;
  sponsor?: string;
  budget?: number;
  programManagerId?: string;
  status?: ProgramStatus;
}

/**
 * Validation rules for CreateProgramDto
 */
export const CreateProgramDtoValidation = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  description: {
    maxLength: 1000,
  },
  startDate: {
    required: true,
  },
  endDate: {
    required: true,
  },
  maxCompanies: {
    min: 1,
    max: 1000,
  },
  budget: {
    min: 0,
  },
} as const;
