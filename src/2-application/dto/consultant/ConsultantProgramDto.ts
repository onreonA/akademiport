/**
 * Consultant Program DTO
 * Sprint 7: Consultant Management
 *
 * Consultant'ın atandığı programlar için DTO
 */

import { z } from 'zod';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';
import type { Program } from '@/domain/entities/Program';

// =====================================================
// CONSULTANT PROGRAM WITH STATS
// =====================================================

/**
 * Consultant Program + İstatistikler
 * Consultant'ın atandığı bir program + o programdaki firma sayısı
 */
export interface ConsultantProgramWithStats {
  // Program bilgileri
  program: Program;

  // İstatistikler
  companiesCount: number;
  activeCompaniesCount: number;

  // Görev istatistikleri (Sprint 8'de kullanılacak)
  tasksCount?: number;
  pendingTasksCount?: number;

  // Eğitim istatistikleri (Sprint 9'da kullanılacak)
  trainingsCount?: number;
  activeTrainingsCount?: number;

  // Atanma bilgisi
  assignedAt: Date;
  roleInProgram: 'consultant' | 'observer';
}

// Zod Schema
export const ConsultantProgramWithStatsSchema = z.object({
  program: z.any(), // Program entity
  companiesCount: z.number().int().min(0),
  activeCompaniesCount: z.number().int().min(0),
  tasksCount: z.number().int().min(0).optional(),
  pendingTasksCount: z.number().int().min(0).optional(),
  trainingsCount: z.number().int().min(0).optional(),
  activeTrainingsCount: z.number().int().min(0).optional(),
  assignedAt: z.date(),
  roleInProgram: z.enum(['consultant', 'observer']),
});

// TypeScript Type
export type ConsultantProgramDto = z.infer<typeof ConsultantProgramWithStatsSchema>;

// =====================================================
// CONSULTANT PROGRAM LIST FILTER
// =====================================================

/**
 * Consultant Program Listesi Filtreleme
 */
export interface ConsultantProgramFilter {
  // Status filter
  status?: ProgramStatus;

  // Search
  search?: string;

  // Sorting
  sortBy?: 'name' | 'startDate' | 'companiesCount' | 'assignedAt';
  sortOrder?: 'asc' | 'desc';

  // Pagination
  page?: number;
  limit?: number;
}

// Zod Schema
export const ConsultantProgramFilterSchema = z.object({
  status: z.nativeEnum(ProgramStatus).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'startDate', 'companiesCount', 'assignedAt']).default('assignedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// TypeScript Type
export type ConsultantProgramFilterDto = z.infer<typeof ConsultantProgramFilterSchema>;

// =====================================================
// CONSULTANT PROGRAM LIST RESPONSE
// =====================================================

/**
 * Consultant Program Listesi Response
 */
export interface ConsultantProgramListResponse {
  programs: ConsultantProgramWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Zod Schema
export const ConsultantProgramListResponseSchema = z.object({
  programs: z.array(ConsultantProgramWithStatsSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

// TypeScript Type
export type ConsultantProgramListDto = z.infer<typeof ConsultantProgramListResponseSchema>;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Parse query parameters to filter
 */
export function parseConsultantProgramFilterParams(
  searchParams: URLSearchParams
): ConsultantProgramFilterDto {
  const filter: ConsultantProgramFilter = {
    status: searchParams.get('status') as ProgramStatus | undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'assignedAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  };

  const result = ConsultantProgramFilterSchema.parse(filter);
  return result;
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Create empty program list response
 */
export function createEmptyProgramListResponse(): ConsultantProgramListResponse {
  return {
    programs: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };
}
