import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetEcommerceMetricsUseCase } from './GetEcommerceMetricsUseCase';
import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { EcommerceMetricsFilterDto } from '@/2-application/dtos/ecommerce';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';
import type { EcommerceMetrics } from '@/3-domain/entities/Ecommerce';

describe('GetEcommerceMetricsUseCase', () => {
  let mockRepository: IEcommerceRepository;
  let useCase: GetEcommerceMetricsUseCase;

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

    useCase = new GetEcommerceMetricsUseCase(mockRepository);
  });

  const createMockMetrics = (): EcommerceMetrics[] => [
    {
      id: 'metric-1',
      companyId: 'company-1',
      programId: 'program-1',
      periodYear: 2025,
      periodMonth: 11,
      platformType: EcommercePlatformType.ALIBABA,
      alibabaVisitors: 1000,
      alibabaProducts: 50,
      alibabaRfqCount: 10,
      alibabaOrders: 5,
      alibabaRevenue: 50000,
      b2cVisitors: 0,
      b2cProducts: 0,
      b2cOrders: 0,
      b2cRevenue: 0,
      totalVisitors: 1000,
      totalProducts: 50,
      totalOrders: 5,
      totalRevenue: 50000,
      notes: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
    },
  ];

  describe('execute', () => {
    it('should get metrics successfully', async () => {
      const filter: EcommerceMetricsFilterDto = {
        companyId: 'company-1',
        programId: 'program-1',
        limit: 20,
        offset: 0,
      };

      const metrics = createMockMetrics();

      vi.mocked(mockRepository.listMetrics).mockResolvedValue(Result.ok(metrics));
      vi.mocked(mockRepository.countMetrics).mockResolvedValue(Result.ok(1));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.metrics).toHaveLength(1);
      expect(result.value?.total).toBe(1);
      expect(mockRepository.listMetrics).toHaveBeenCalled();
      expect(mockRepository.countMetrics).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      const filter: EcommerceMetricsFilterDto = {
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
        platformType: EcommercePlatformType.ALIBABA,
        limit: 10,
        offset: 0,
      };

      const metrics = createMockMetrics();

      vi.mocked(mockRepository.listMetrics).mockResolvedValue(Result.ok(metrics));
      vi.mocked(mockRepository.countMetrics).mockResolvedValue(Result.ok(1));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.listMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'company-1',
          programId: 'program-1',
          periodYear: 2025,
          periodMonth: 11,
          platformType: EcommercePlatformType.ALIBABA,
        })
      );
    });

    it('should handle empty results', async () => {
      const filter: EcommerceMetricsFilterDto = {
        companyId: 'company-1',
      };

      vi.mocked(mockRepository.listMetrics).mockResolvedValue(Result.ok([]));
      vi.mocked(mockRepository.countMetrics).mockResolvedValue(Result.ok(0));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.metrics).toHaveLength(0);
      expect(result.value?.total).toBe(0);
    });

    it('should fail when repository fails', async () => {
      const filter: EcommerceMetricsFilterDto = {
        companyId: 'company-1',
      };

      vi.mocked(mockRepository.listMetrics).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(filter);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should fail when count fails', async () => {
      const filter: EcommerceMetricsFilterDto = {
        companyId: 'company-1',
      };

      const metrics = createMockMetrics();

      vi.mocked(mockRepository.listMetrics).mockResolvedValue(Result.ok(metrics));
      vi.mocked(mockRepository.countMetrics).mockResolvedValue(Result.fail('Count error'));

      const result = await useCase.execute(filter);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });
  });
});
