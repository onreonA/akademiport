import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetMinistryDashboardUseCase } from './GetMinistryDashboardUseCase';
import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import type { EcommercePerformance } from '@/3-domain/entities/Ecommerce';

describe('GetMinistryDashboardUseCase', () => {
  let mockRepository: IEcommerceRepository;
  let useCase: GetMinistryDashboardUseCase;

  beforeEach(() => {
    mockRepository = {
      createMetrics: vi.fn(),
      updateMetrics: vi.fn(),
      findMetricsById: vi.fn(),
      findMetricsByCompanyAndPeriod: vi.fn(),
      listMetrics: vi.fn(),
      countMetrics: vi.fn(),
      deleteMetrics: vi.fn(),
      refreshPerformance: vi.fn(),
      getPerformance: vi.fn(),
      getCompanyPerformance: vi.fn(),
      getMinistryDashboard: vi.fn(),
    } as any;

    useCase = new GetMinistryDashboardUseCase(mockRepository);
  });

  const createMockDashboard = () => ({
    totalCompanies: 10,
    totalRevenue: 5000000,
    avgRevenue: 500000,
    totalOrders: 1000,
    totalVisitors: 50000,
    growthRate: 15.5,
    topCompanies: [
      {
        companyId: 'company-1',
        companyName: 'Top Company',
        programId: 'program-1',
        programName: 'Test Program',
        totalVisitorsAllTime: 10000,
        totalProductsAllTime: 500,
        totalOrdersAllTime: 100,
        totalRevenueAllTime: 1000000,
        visitorsLast3Months: 3000,
        ordersLast3Months: 30,
        revenueLast3Months: 300000,
        visitorsLastMonth: 1000,
        ordersLastMonth: 10,
        revenueLastMonth: 100000,
        alibabaRevenueTotal: 600000,
        b2cRevenueTotal: 400000,
        avgMonthlyRevenue: 100000,
        revenueGrowthPercentage: 20.0,
        lastUpdatedAt: new Date(),
        lastPeriod: '2025-11',
      },
    ] as EcommercePerformance[],
    platformDistribution: [
      { platform: 'alibaba', revenue: 3000000, companies: 5 },
      { platform: 'amazon', revenue: 1500000, companies: 3 },
      { platform: 'trendyol', revenue: 500000, companies: 2 },
    ],
  });

  describe('execute', () => {
    it('should get dashboard data successfully without programId', async () => {
      const dashboard = createMockDashboard();

      vi.mocked(mockRepository.getMinistryDashboard).mockResolvedValue(Result.ok(dashboard));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value?.totalCompanies).toBe(10);
      expect(result.value?.totalRevenue).toBe(5000000);
      expect(result.value?.avgRevenue).toBe(500000);
      expect(result.value?.topCompanies).toHaveLength(1);
      expect(result.value?.platformDistribution).toHaveLength(3);
      expect(mockRepository.getMinistryDashboard).toHaveBeenCalledWith(undefined);
    });

    it('should get dashboard data successfully with programId', async () => {
      const dashboard = createMockDashboard();

      vi.mocked(mockRepository.getMinistryDashboard).mockResolvedValue(Result.ok(dashboard));

      const result = await useCase.execute('program-1');

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.getMinistryDashboard).toHaveBeenCalledWith('program-1');
    });

    it('should fail when repository fails', async () => {
      vi.mocked(mockRepository.getMinistryDashboard).mockResolvedValue(
        Result.fail('Database error')
      );

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });
  });
});
