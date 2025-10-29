/**
 * Consultant DTOs - Barrel Export
 * Sprint 7: Consultant Management
 */

// Dashboard DTOs
export type {
  ConsultantDashboardStats,
  ConsultantDashboardData,
  ConsultantDashboardDto,
} from './ConsultantDashboardDto';

export {
  ConsultantDashboardStatsSchema,
  ConsultantDashboardDataSchema,
  createEmptyDashboardStats,
  validateDashboardStats,
} from './ConsultantDashboardDto';

// Program DTOs
export type {
  ConsultantProgramWithStats,
  ConsultantProgramDto,
  ConsultantProgramFilter,
  ConsultantProgramFilterDto,
  ConsultantProgramListResponse,
  ConsultantProgramListDto,
} from './ConsultantProgramDto';

export {
  ConsultantProgramWithStatsSchema,
  ConsultantProgramFilterSchema,
  ConsultantProgramListResponseSchema,
  parseConsultantProgramFilterParams,
  calculateTotalPages as calculateProgramTotalPages,
  createEmptyProgramListResponse,
} from './ConsultantProgramDto';

// Company DTOs
export type {
  ConsultantCompanyWithStats,
  ConsultantCompanyDto,
  ConsultantCompanyFilter,
  ConsultantCompanyFilterDto,
  ConsultantCompanyListResponse,
  ConsultantCompanyListDto,
} from './ConsultantCompanyDto';

export {
  ConsultantCompanyWithStatsSchema,
  ConsultantCompanyFilterSchema,
  ConsultantCompanyListResponseSchema,
  parseConsultantCompanyFilterParams,
  calculateTotalPages as calculateCompanyTotalPages,
  createEmptyCompanyListResponse,
} from './ConsultantCompanyDto';

