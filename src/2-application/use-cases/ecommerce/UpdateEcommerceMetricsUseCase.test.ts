import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateEcommerceMetricsUseCase } from './UpdateEcommerceMetricsUseCase';
import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { UpdateEcommerceMetricsDto } from '@/2-application/dtos/ecommerce';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';
import type { EcommerceMetrics } from '@/3-domain/entities/Ecommerce';

describe('UpdateEcommerceMetricsUseCase', () => {
  let mockRepository: IEcommerceRepository;
  let useCase: UpdateEcommerceMetricsUseCase;

  beforeEach(() => {
    mockRepository = {
      createMetrics: vi.fn(),
      updateMetrics: vi.fn(),
      findMetricsById: vi.fn(),
      findMetricsByCompanyAndPeriod: vi.fn(),
      listMetrics: vi.fn(),
      countMetrics: vi.fn(),
      deleteMetrics: vi.fn(),
      refreshPerformance: vi.fn().mockResolvedValue(Result.ok(undefined)),
      getPerformance: vi.fn(),
      getCompanyPerformance: vi.fn(),
      getMinistryDashboard: vi.fn(),
    } as any;

    useCase = new UpdateEcommerceMetricsUseCase(mockRepository);
  });

  const createMockMetrics = (): EcommerceMetrics => ({
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
    notes: 'Test notes',
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
  });

  describe('execute', () => {
    it('should update metrics successfully', async () => {
      const existingMetrics = createMockMetrics();
      const dto: UpdateEcommerceMetricsDto = {
        alibabaVisitors: 1500,
        alibabaOrders: 10,
        alibabaRevenue: 75000,
      };

      const updatedMetrics: EcommerceMetrics = {
        ...existingMetrics,
        alibabaVisitors: 1500,
        alibabaOrders: 10,
        alibabaRevenue: 75000,
        totalVisitors: 1500,
        totalOrders: 10,
        totalRevenue: 75000,
      };

      vi.mocked(mockRepository.findMetricsById).mockResolvedValue(Result.ok(existingMetrics));
      vi.mocked(mockRepository.updateMetrics).mockResolvedValue(Result.ok(updatedMetrics));

      const result = await useCase.execute('metric-1', dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe('metric-1');
      expect(mockRepository.findMetricsById).toHaveBeenCalledWith('metric-1');
      expect(mockRepository.updateMetrics).toHaveBeenCalledWith('metric-1', dto);
    });

    it('should fail when metrics not found', async () => {
      const dto: UpdateEcommerceMetricsDto = {
        alibabaVisitors: 1500,
      };

      vi.mocked(mockRepository.findMetricsById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute('metric-1', dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Metrik bulunamadı');
      expect(mockRepository.updateMetrics).not.toHaveBeenCalled();
    });

    it('should fail when repository update fails', async () => {
      const existingMetrics = createMockMetrics();
      const dto: UpdateEcommerceMetricsDto = {
        alibabaVisitors: 1500,
      };

      vi.mocked(mockRepository.findMetricsById).mockResolvedValue(Result.ok(existingMetrics));
      vi.mocked(mockRepository.updateMetrics).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('metric-1', dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should update B2C metrics successfully', async () => {
      const existingMetrics: EcommerceMetrics = {
        ...createMockMetrics(),
        platformType: EcommercePlatformType.AMAZON,
        b2cVisitors: 2000,
        b2cProducts: 100,
        b2cOrders: 20,
        b2cRevenue: 100000,
      };

      const dto: UpdateEcommerceMetricsDto = {
        b2cVisitors: 2500,
        b2cOrders: 30,
        b2cRevenue: 150000,
      };

      const updatedMetrics: EcommerceMetrics = {
        ...existingMetrics,
        b2cVisitors: 2500,
        b2cOrders: 30,
        b2cRevenue: 150000,
      };

      vi.mocked(mockRepository.findMetricsById).mockResolvedValue(Result.ok(existingMetrics));
      vi.mocked(mockRepository.updateMetrics).mockResolvedValue(Result.ok(updatedMetrics));

      const result = await useCase.execute('metric-1', dto);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.updateMetrics).toHaveBeenCalledWith('metric-1', dto);
    });
  });
});
