import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetEcommercePerformanceUseCase } from './GetEcommercePerformanceUseCase';
import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { EcommercePerformanceFilterDto } from '@/2-application/dtos/ecommerce';
import type { EcommercePerformance } from '@/3-domain/entities/Ecommerce';

describe('GetEcommercePerformanceUseCase', () => {
  let mockRepository: IEcommerceRepository;
  let useCase: GetEcommercePerformanceUseCase;

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

    useCase = new GetEcommercePerformanceUseCase(mockRepository);
  });

  const createMockPerformance = (): EcommercePerformance[] => [
    {
      companyId: 'company-1',
      companyName: 'Test Company',
      programId: 'program-1',
      programName: 'Test Program',
      totalVisitorsAllTime: 10000,
      totalProductsAllTime: 500,
      totalOrdersAllTime: 100,
      totalRevenueAllTime: 500000,
      visitorsLast3Months: 3000,
      ordersLast3Months: 30,
      revenueLast3Months: 150000,
      visitorsLastMonth: 1000,
      ordersLastMonth: 10,
      revenueLastMonth: 50000,
      alibabaRevenueTotal: 300000,
      b2cRevenueTotal: 200000,
      avgMonthlyRevenue: 50000,
      revenueGrowthPercentage: 10.5,
      lastUpdatedAt: new Date(),
      lastPeriod: '2025-11',
    },
  ];

  describe('execute', () => {
    it('should get performance data successfully', async () => {
      const filter: EcommercePerformanceFilterDto = {
        programId: 'program-1',
        limit: 20,
        offset: 0,
      };

      const performance = createMockPerformance();

      vi.mocked(mockRepository.getPerformance).mockResolvedValue(Result.ok(performance));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value?.[0].companyId).toBe('company-1');
      expect(mockRepository.getPerformance).toHaveBeenCalledWith(
        expect.objectContaining({
          programId: 'program-1',
          limit: 20,
          offset: 0,
        })
      );
    });

    it('should apply filters correctly', async () => {
      const filter: EcommercePerformanceFilterDto = {
        programId: 'program-1',
        companyId: 'company-1',
        minRevenue: 100000,
        limit: 10,
      };

      const performance = createMockPerformance();

      vi.mocked(mockRepository.getPerformance).mockResolvedValue(Result.ok(performance));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.getPerformance).toHaveBeenCalledWith(
        expect.objectContaining({
          programId: 'program-1',
          companyId: 'company-1',
          minRevenue: 100000,
          limit: 10,
        })
      );
    });

    it('should handle empty results', async () => {
      const filter: EcommercePerformanceFilterDto = {
        programId: 'program-1',
      };

      vi.mocked(mockRepository.getPerformance).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(0);
    });

    it('should fail when repository fails', async () => {
      const filter: EcommercePerformanceFilterDto = {
        programId: 'program-1',
      };

      vi.mocked(mockRepository.getPerformance).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(filter);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });
  });
});
