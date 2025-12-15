import { Result } from '@/6-core/result/Result';
import { EcommerceMetrics, EcommercePerformance } from '@/3-domain/entities/Ecommerce';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';

export interface CreateEcommerceMetricsParams {
  companyId: string;
  programId: string;
  periodYear: number;
  periodMonth: number;
  platformType: EcommercePlatformType;
  alibabaVisitors?: number;
  alibabaVisitorSectorAvg?: number;
  alibabaProducts?: number;
  alibabaRfqCount?: number;
  alibabaOrders?: number;
  alibabaRevenue?: number;
  alibabaMessageSectorAvg?: number;
  alibabaSeriousBuyerCount?: number;
  b2cVisitors?: number;
  b2cProducts?: number;
  b2cOrders?: number;
  b2cRevenue?: number;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdBy?: string | null;
}

export interface UpdateEcommerceMetricsParams {
  alibabaVisitors?: number;
  alibabaVisitorSectorAvg?: number;
  alibabaProducts?: number;
  alibabaRfqCount?: number;
  alibabaOrders?: number;
  alibabaRevenue?: number;
  alibabaMessageSectorAvg?: number;
  alibabaSeriousBuyerCount?: number;
  b2cVisitors?: number;
  b2cProducts?: number;
  b2cOrders?: number;
  b2cRevenue?: number;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface EcommerceMetricsFilter {
  companyId?: string;
  programId?: string;
  periodYear?: number;
  periodMonth?: number;
  platformType?: EcommercePlatformType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface EcommercePerformanceFilter {
  programId?: string;
  companyId?: string;
  minRevenue?: number;
  limit?: number;
  offset?: number;
}

export interface IEcommerceRepository {
  /**
   * Create e-commerce metrics
   */
  createMetrics(params: CreateEcommerceMetricsParams): Promise<Result<EcommerceMetrics>>;

  /**
   * Update e-commerce metrics
   */
  updateMetrics(
    id: string,
    params: UpdateEcommerceMetricsParams
  ): Promise<Result<EcommerceMetrics>>;

  /**
   * Get e-commerce metrics by ID
   */
  findMetricsById(id: string): Promise<Result<EcommerceMetrics | null>>;

  /**
   * Get e-commerce metrics by company and period
   */
  findMetricsByCompanyAndPeriod(
    companyId: string,
    programId: string,
    periodYear: number,
    periodMonth: number,
    platformType: EcommercePlatformType
  ): Promise<Result<EcommerceMetrics | null>>;

  /**
   * List e-commerce metrics with filters
   */
  listMetrics(filter: EcommerceMetricsFilter): Promise<Result<EcommerceMetrics[]>>;

  /**
   * Get metrics count
   */
  countMetrics(filter: EcommerceMetricsFilter): Promise<Result<number>>;

  /**
   * Delete e-commerce metrics
   */
  deleteMetrics(id: string): Promise<Result<void>>;

  /**
   * Refresh e-commerce performance view
   */
  refreshPerformance(): Promise<Result<void>>;

  /**
   * Get e-commerce performance list
   */
  getPerformance(filter: EcommercePerformanceFilter): Promise<Result<EcommercePerformance[]>>;

  /**
   * Get e-commerce performance for a company
   */
  getCompanyPerformance(companyId: string): Promise<Result<EcommercePerformance | null>>;

  /**
   * Get ministry dashboard statistics
   */
  getMinistryDashboard(programId?: string): Promise<
    Result<{
      totalCompanies: number;
      totalRevenue: number;
      avgRevenue: number;
      totalOrders: number;
      totalVisitors: number;
      growthRate: number;
      topCompanies: EcommercePerformance[];
      platformDistribution: {
        platform: string;
        revenue: number;
        companies: number;
      }[];
    }>
  >;
}
