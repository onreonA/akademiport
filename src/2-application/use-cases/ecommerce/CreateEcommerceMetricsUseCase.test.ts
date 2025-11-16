import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateEcommerceMetricsUseCase } from './CreateEcommerceMetricsUseCase';
import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { CreateEcommerceMetricsDto } from '@/2-application/dtos/ecommerce';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';
import type { EcommerceMetrics } from '@/3-domain/entities/Ecommerce';

describe('CreateEcommerceMetricsUseCase', () => {
  let mockRepository: IEcommerceRepository;
  let useCase: CreateEcommerceMetricsUseCase;

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

    useCase = new CreateEcommerceMetricsUseCase(mockRepository);
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
    metadata: { source: 'manual' },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
  });

  describe('execute', () => {
    it('should create metrics successfully', async () => {
      const dto: CreateEcommerceMetricsDto = {
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
        notes: 'Test notes',
      };

      const createdMetrics = createMockMetrics();

      vi.mocked(mockRepository.findMetricsByCompanyAndPeriod).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.createMetrics).mockResolvedValue(Result.ok(createdMetrics));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe('metric-1');
      expect(mockRepository.findMetricsByCompanyAndPeriod).toHaveBeenCalledWith(
        'company-1',
        'program-1',
        2025,
        11,
        EcommercePlatformType.ALIBABA
      );
      expect(mockRepository.createMetrics).toHaveBeenCalled();
    });

    it('should fail when metrics already exist for period', async () => {
      const dto: CreateEcommerceMetricsDto = {
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
        platformType: EcommercePlatformType.ALIBABA,
        alibabaVisitors: 1000,
      };

      const existingMetrics = createMockMetrics();

      vi.mocked(mockRepository.findMetricsByCompanyAndPeriod).mockResolvedValue(
        Result.ok(existingMetrics)
      );

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('zaten metrik kaydı mevcut');
      expect(mockRepository.createMetrics).not.toHaveBeenCalled();
    });

    it('should fail when validation fails', async () => {
      const dto: CreateEcommerceMetricsDto = {
        companyId: '',
        programId: '',
        periodYear: 2019, // Invalid year
        periodMonth: 13, // Invalid month
        platformType: EcommercePlatformType.ALIBABA,
      };

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBeDefined();
    });

    it('should fail when repository fails', async () => {
      const dto: CreateEcommerceMetricsDto = {
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
        platformType: EcommercePlatformType.ALIBABA,
        alibabaVisitors: 1000,
      };

      vi.mocked(mockRepository.findMetricsByCompanyAndPeriod).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.createMetrics).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should create B2C platform metrics successfully', async () => {
      const dto: CreateEcommerceMetricsDto = {
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
        platformType: EcommercePlatformType.AMAZON,
        b2cVisitors: 2000,
        b2cProducts: 100,
        b2cOrders: 20,
        b2cRevenue: 100000,
      };

      const createdMetrics: EcommerceMetrics = {
        ...createMockMetrics(),
        platformType: EcommercePlatformType.AMAZON,
        alibabaVisitors: 0,
        alibabaProducts: 0,
        alibabaRfqCount: 0,
        alibabaOrders: 0,
        alibabaRevenue: 0,
        b2cVisitors: 2000,
        b2cProducts: 100,
        b2cOrders: 20,
        b2cRevenue: 100000,
        totalVisitors: 2000,
        totalProducts: 100,
        totalOrders: 20,
        totalRevenue: 100000,
      };

      vi.mocked(mockRepository.findMetricsByCompanyAndPeriod).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.createMetrics).mockResolvedValue(Result.ok(createdMetrics));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.createMetrics).toHaveBeenCalled();
    });
  });
});
