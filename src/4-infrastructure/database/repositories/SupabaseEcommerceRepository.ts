import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import {
  IEcommerceRepository,
  CreateEcommerceMetricsParams,
  UpdateEcommerceMetricsParams,
  EcommerceMetricsFilter,
  EcommercePerformanceFilter,
} from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { EcommerceMetrics, EcommercePerformance } from '@/3-domain/entities/Ecommerce';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';

export class SupabaseEcommerceRepository implements IEcommerceRepository {
  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  // =====================================================
  // METRICS CRUD
  // =====================================================

  async createMetrics(params: CreateEcommerceMetricsParams): Promise<Result<EcommerceMetrics>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('ecommerce_metrics')
        .insert({
          company_id: params.companyId,
          program_id: params.programId,
          period_year: params.periodYear,
          period_month: params.periodMonth,
          platform_type: params.platformType,
          alibaba_visitors: params.alibabaVisitors ?? 0,
          alibaba_products: params.alibabaProducts ?? 0,
          alibaba_rfq_count: params.alibabaRfqCount ?? 0,
          alibaba_orders: params.alibabaOrders ?? 0,
          alibaba_revenue: params.alibabaRevenue ?? 0,
          b2c_visitors: params.b2cVisitors ?? 0,
          b2c_products: params.b2cProducts ?? 0,
          b2c_orders: params.b2cOrders ?? 0,
          b2c_revenue: params.b2cRevenue ?? 0,
          notes: params.notes ?? null,
          metadata: params.metadata ?? null,
          created_by: params.createdBy ?? null,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Metrik oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEcommerceMetrics(data));
    } catch (error) {
      return Result.fail(`Metrik oluşturulamadı: ${error}`);
    }
  }

  async updateMetrics(
    id: string,
    params: UpdateEcommerceMetricsParams
  ): Promise<Result<EcommerceMetrics>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: Record<string, unknown> = {};

      if (params.alibabaVisitors !== undefined)
        updateData.alibaba_visitors = params.alibabaVisitors;
      if (params.alibabaProducts !== undefined)
        updateData.alibaba_products = params.alibabaProducts;
      if (params.alibabaRfqCount !== undefined)
        updateData.alibaba_rfq_count = params.alibabaRfqCount;
      if (params.alibabaOrders !== undefined) updateData.alibaba_orders = params.alibabaOrders;
      if (params.alibabaRevenue !== undefined) updateData.alibaba_revenue = params.alibabaRevenue;
      if (params.b2cVisitors !== undefined) updateData.b2c_visitors = params.b2cVisitors;
      if (params.b2cProducts !== undefined) updateData.b2c_products = params.b2cProducts;
      if (params.b2cOrders !== undefined) updateData.b2c_orders = params.b2cOrders;
      if (params.b2cRevenue !== undefined) updateData.b2c_revenue = params.b2cRevenue;
      if (params.notes !== undefined) updateData.notes = params.notes;
      if (params.metadata !== undefined) updateData.metadata = params.metadata;

      const { data, error } = await supabase
        .from('ecommerce_metrics')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Metrik güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToEcommerceMetrics(data));
    } catch (error) {
      return Result.fail(`Metrik güncellenemedi: ${error}`);
    }
  }

  async findMetricsById(id: string): Promise<Result<EcommerceMetrics | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('ecommerce_metrics')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Metrik bulunamadı: ${error.message}`);
      }

      return Result.ok(data ? this.mapToEcommerceMetrics(data) : null);
    } catch (error) {
      return Result.fail(`Metrik bulunamadı: ${error}`);
    }
  }

  async findMetricsByCompanyAndPeriod(
    companyId: string,
    programId: string,
    periodYear: number,
    periodMonth: number,
    platformType: EcommercePlatformType
  ): Promise<Result<EcommerceMetrics | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('ecommerce_metrics')
        .select('*')
        .eq('company_id', companyId)
        .eq('program_id', programId)
        .eq('period_year', periodYear)
        .eq('period_month', periodMonth)
        .eq('platform_type', platformType)
        .maybeSingle();

      if (error) {
        return Result.fail(`Metrik bulunamadı: ${error.message}`);
      }

      return Result.ok(data ? this.mapToEcommerceMetrics(data) : null);
    } catch (error) {
      return Result.fail(`Metrik bulunamadı: ${error}`);
    }
  }

  async listMetrics(filter: EcommerceMetricsFilter): Promise<Result<EcommerceMetrics[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('ecommerce_metrics').select('*');

      if (filter.companyId) {
        query = query.eq('company_id', filter.companyId);
      }

      if (filter.programId) {
        query = query.eq('program_id', filter.programId);
      }

      if (filter.periodYear) {
        query = query.eq('period_year', filter.periodYear);
      }

      if (filter.periodMonth) {
        query = query.eq('period_month', filter.periodMonth);
      }

      if (filter.platformType) {
        query = query.eq('platform_type', filter.platformType);
      }

      if (filter.startDate) {
        query = query.gte('created_at', filter.startDate.toISOString());
      }

      if (filter.endDate) {
        query = query.lte('created_at', filter.endDate.toISOString());
      }

      // Order by period (newest first)
      query = query
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false });

      // Apply pagination
      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(`Metrikler alınamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEcommerceMetrics(item)));
    } catch (error) {
      return Result.fail(`Metrikler alınamadı: ${error}`);
    }
  }

  async countMetrics(filter: EcommerceMetricsFilter): Promise<Result<number>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('ecommerce_metrics').select('*', { count: 'exact', head: true });

      if (filter.companyId) {
        query = query.eq('company_id', filter.companyId);
      }

      if (filter.programId) {
        query = query.eq('program_id', filter.programId);
      }

      if (filter.periodYear) {
        query = query.eq('period_year', filter.periodYear);
      }

      if (filter.periodMonth) {
        query = query.eq('period_month', filter.periodMonth);
      }

      if (filter.platformType) {
        query = query.eq('platform_type', filter.platformType);
      }

      if (filter.startDate) {
        query = query.gte('created_at', filter.startDate.toISOString());
      }

      if (filter.endDate) {
        query = query.lte('created_at', filter.endDate.toISOString());
      }

      const { count, error } = await query;

      if (error) {
        return Result.fail(`Metrik sayısı alınamadı: ${error.message}`);
      }

      return Result.ok(count || 0);
    } catch (error) {
      return Result.fail(`Metrik sayısı alınamadı: ${error}`);
    }
  }

  async deleteMetrics(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('ecommerce_metrics').delete().eq('id', id);

      if (error) {
        return Result.fail(`Metrik silinemedi: ${error.message}`);
      }

      // Refresh performance view (async)
      this.refreshPerformance().catch((error) => {
        console.error('Failed to refresh ecommerce performance:', error);
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Metrik silinemedi: ${error}`);
    }
  }

  // =====================================================
  // PERFORMANCE
  // =====================================================

  async refreshPerformance(): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.rpc('refresh_ecommerce_performance');

      if (error) {
        return Result.fail(`Performans görünümü yenilenemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Performans görünümü yenilenemedi: ${error}`);
    }
  }

  async getPerformance(
    filter: EcommercePerformanceFilter
  ): Promise<Result<EcommercePerformance[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('ecommerce_performance').select('*');

      if (filter.programId) {
        query = query.eq('program_id', filter.programId);
      }

      if (filter.companyId) {
        query = query.eq('company_id', filter.companyId);
      }

      if (filter.minRevenue !== undefined) {
        query = query.gte('total_revenue_all_time', filter.minRevenue);
      }

      // Order by revenue (highest first)
      query = query.order('total_revenue_all_time', { ascending: false });

      // Apply pagination
      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(`Performans verileri alınamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEcommercePerformance(item)));
    } catch (error) {
      return Result.fail(`Performans verileri alınamadı: ${error}`);
    }
  }

  async getCompanyPerformance(companyId: string): Promise<Result<EcommercePerformance | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('ecommerce_performance')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        return Result.fail(`Firma performansı alınamadı: ${error.message}`);
      }

      return Result.ok(data ? this.mapToEcommercePerformance(data) : null);
    } catch (error) {
      return Result.fail(`Firma performansı alınamadı: ${error}`);
    }
  }

  async getMinistryDashboard(programId?: string): Promise<
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
  > {
    try {
      const supabase = await this.getSupabaseClient();

      // Get performance data
      let performanceQuery = supabase.from('ecommerce_performance').select('*');

      if (programId) {
        performanceQuery = performanceQuery.eq('program_id', programId);
      }

      const { data: performanceData, error: performanceError } = await performanceQuery;

      if (performanceError) {
        return Result.fail(`Performans verileri alınamadı: ${performanceError.message}`);
      }

      // Get metrics for platform distribution
      let metricsQuery = supabase
        .from('ecommerce_metrics')
        .select('platform_type, total_revenue, company_id');

      if (programId) {
        metricsQuery = metricsQuery.eq('program_id', programId);
      }

      const { data: metricsData, error: metricsError } = await metricsQuery;

      if (metricsError) {
        return Result.fail(`Metrik verileri alınamadı: ${metricsError.message}`);
      }

      // Calculate statistics
      const totalCompanies = performanceData?.length || 0;
      const totalRevenue =
        performanceData?.reduce((sum, item) => sum + Number(item.total_revenue_all_time || 0), 0) ||
        0;
      const avgRevenue = totalCompanies > 0 ? totalRevenue / totalCompanies : 0;
      const totalOrders =
        performanceData?.reduce((sum, item) => sum + Number(item.total_orders_all_time || 0), 0) ||
        0;
      const totalVisitors =
        performanceData?.reduce(
          (sum, item) => sum + Number(item.total_visitors_all_time || 0),
          0
        ) || 0;

      // Calculate growth rate (average of all companies)
      const growthRate =
        performanceData && performanceData.length > 0
          ? performanceData.reduce(
              (sum, item) => sum + Number(item.revenue_growth_percentage || 0),
              0
            ) / performanceData.length
          : 0;

      // Get top 10 companies by revenue
      const topCompanies = (performanceData || [])
        .map((item) => this.mapToEcommercePerformance(item))
        .sort((a, b) => b.totalRevenueAllTime - a.totalRevenueAllTime)
        .slice(0, 10);

      // Calculate platform distribution
      const platformMap = new Map<string, { revenue: number; companies: Set<string> }>();

      (metricsData || []).forEach((metric: any) => {
        const platform = metric.platform_type;
        const revenue = Number(metric.total_revenue || 0);
        const companyId = metric.company_id;

        if (!platformMap.has(platform)) {
          platformMap.set(platform, { revenue: 0, companies: new Set() });
        }

        const platformData = platformMap.get(platform)!;
        platformData.revenue += revenue;
        platformData.companies.add(companyId);
      });

      const platformDistribution = Array.from(platformMap.entries()).map(([platform, data]) => ({
        platform,
        revenue: data.revenue,
        companies: data.companies.size,
      }));

      return Result.ok({
        totalCompanies,
        totalRevenue,
        avgRevenue,
        totalOrders,
        totalVisitors,
        growthRate,
        topCompanies,
        platformDistribution,
      });
    } catch (error) {
      return Result.fail(`Dashboard verileri alınamadı: ${error}`);
    }
  }

  // =====================================================
  // MAPPERS
  // =====================================================

  private mapToEcommerceMetrics(data: any): EcommerceMetrics {
    return {
      id: data.id,
      companyId: data.company_id,
      programId: data.program_id,
      periodYear: data.period_year,
      periodMonth: data.period_month,
      platformType: data.platform_type as EcommercePlatformType,
      alibabaVisitors: data.alibaba_visitors || 0,
      alibabaProducts: data.alibaba_products || 0,
      alibabaRfqCount: data.alibaba_rfq_count || 0,
      alibabaOrders: data.alibaba_orders || 0,
      alibabaRevenue: Number(data.alibaba_revenue || 0),
      b2cVisitors: data.b2c_visitors || 0,
      b2cProducts: data.b2c_products || 0,
      b2cOrders: data.b2c_orders || 0,
      b2cRevenue: Number(data.b2c_revenue || 0),
      totalVisitors: data.total_visitors || 0,
      totalProducts: data.total_products || 0,
      totalOrders: data.total_orders || 0,
      totalRevenue: Number(data.total_revenue || 0),
      notes: data.notes || null,
      metadata: data.metadata || null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by || null,
    };
  }

  private mapToEcommercePerformance(data: any): EcommercePerformance {
    return {
      companyId: data.company_id,
      companyName: data.company_name,
      programId: data.program_id,
      programName: data.program_name,
      totalVisitorsAllTime: data.total_visitors_all_time || 0,
      totalProductsAllTime: data.total_products_all_time || 0,
      totalOrdersAllTime: data.total_orders_all_time || 0,
      totalRevenueAllTime: Number(data.total_revenue_all_time || 0),
      visitorsLast3Months: data.visitors_last_3_months || 0,
      ordersLast3Months: data.orders_last_3_months || 0,
      revenueLast3Months: Number(data.revenue_last_3_months || 0),
      visitorsLastMonth: data.visitors_last_month || 0,
      ordersLastMonth: data.orders_last_month || 0,
      revenueLastMonth: Number(data.revenue_last_month || 0),
      alibabaRevenueTotal: Number(data.alibaba_revenue_total || 0),
      b2cRevenueTotal: Number(data.b2c_revenue_total || 0),
      avgMonthlyRevenue: Number(data.avg_monthly_revenue || 0),
      revenueGrowthPercentage: Number(data.revenue_growth_percentage || 0),
      lastUpdatedAt: data.last_updated_at ? new Date(data.last_updated_at) : null,
      lastPeriod: data.last_period || null,
    };
  }
}
