import { describe, it, expect } from 'vitest';
import { EcommerceMetricsEntity } from './Ecommerce';
import { EcommercePlatformType } from '../enums/EcommerceEnums';

describe('EcommerceMetricsEntity', () => {
  const createValidMetrics = () => ({
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

  describe('isValidPeriod', () => {
    it('should return true for valid period', () => {
      const metrics = new EcommerceMetricsEntity(createValidMetrics());
      expect(metrics.isValidPeriod()).toBe(true);
    });

    it('should return false for invalid year', () => {
      const metrics = new EcommerceMetricsEntity({
        ...createValidMetrics(),
        periodYear: 2019,
      });
      expect(metrics.isValidPeriod()).toBe(false);

      const metrics2 = new EcommerceMetricsEntity({
        ...createValidMetrics(),
        periodYear: 2101,
      });
      expect(metrics2.isValidPeriod()).toBe(false);
    });

    it('should return false for invalid month', () => {
      const metrics = new EcommerceMetricsEntity({
        ...createValidMetrics(),
        periodMonth: 0,
      });
      expect(metrics.isValidPeriod()).toBe(false);

      const metrics2 = new EcommerceMetricsEntity({
        ...createValidMetrics(),
        periodMonth: 13,
      });
      expect(metrics2.isValidPeriod()).toBe(false);
    });
  });

  describe('isValidMetrics', () => {
    it('should return true for valid metrics', () => {
      const metrics = new EcommerceMetricsEntity(createValidMetrics());
      expect(metrics.isValidMetrics()).toBe(true);
    });

    it('should return false for negative values', () => {
      const metrics = new EcommerceMetricsEntity({
        ...createValidMetrics(),
        alibabaVisitors: -1,
      });
      expect(metrics.isValidMetrics()).toBe(false);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate totals for Alibaba platform', () => {
      const metrics = new EcommerceMetricsEntity({
        ...createValidMetrics(),
        platformType: EcommercePlatformType.ALIBABA,
        alibabaVisitors: 1000,
        alibabaProducts: 50,
        alibabaOrders: 5,
        alibabaRevenue: 50000,
        totalVisitors: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
      });

      metrics.calculateTotals();

      expect(metrics.totalVisitors).toBe(1000);
      expect(metrics.totalProducts).toBe(50);
      expect(metrics.totalOrders).toBe(5);
      expect(metrics.totalRevenue).toBe(50000);
    });

    it('should calculate totals for B2C platform', () => {
      const metrics = new EcommerceMetricsEntity({
        ...createValidMetrics(),
        platformType: EcommercePlatformType.AMAZON,
        b2cVisitors: 2000,
        b2cProducts: 100,
        b2cOrders: 10,
        b2cRevenue: 100000,
        totalVisitors: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
      });

      metrics.calculateTotals();

      expect(metrics.totalVisitors).toBe(2000);
      expect(metrics.totalProducts).toBe(100);
      expect(metrics.totalOrders).toBe(10);
      expect(metrics.totalRevenue).toBe(100000);
    });
  });

  describe('validate', () => {
    it('should return empty array for valid data', () => {
      const errors = EcommerceMetricsEntity.validate({
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
        platformType: EcommercePlatformType.ALIBABA,
        alibabaVisitors: 1000,
        alibabaProducts: 50,
        alibabaOrders: 5,
        alibabaRevenue: 50000,
      });

      expect(errors).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const errors = EcommerceMetricsEntity.validate({
        companyId: '',
        programId: '',
        periodYear: 0,
        periodMonth: 0,
        platformType: undefined as any,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('Firma ID'))).toBe(true);
      expect(errors.some((e) => e.includes('Program ID'))).toBe(true);
      expect(errors.some((e) => e.includes('yıl'))).toBe(true);
      expect(errors.some((e) => e.includes('ay'))).toBe(true);
      expect(errors.some((e) => e.includes('Platform tipi'))).toBe(true);
    });

    it('should return errors for invalid year', () => {
      const errors = EcommerceMetricsEntity.validate({
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2019,
        periodMonth: 11,
        platformType: EcommercePlatformType.ALIBABA,
      });

      expect(errors.some((e) => e.includes('yıl'))).toBe(true);
    });

    it('should return errors for invalid month', () => {
      const errors = EcommerceMetricsEntity.validate({
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 13,
        platformType: EcommercePlatformType.ALIBABA,
      });

      expect(errors.some((e) => e.includes('ay'))).toBe(true);
    });

    it('should return errors for negative values', () => {
      const errors = EcommerceMetricsEntity.validate({
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
        platformType: EcommercePlatformType.ALIBABA,
        alibabaVisitors: -1,
        alibabaRevenue: -100,
      });

      expect(errors.some((e) => e.includes('negatif'))).toBe(true);
      expect(errors.some((e) => e.includes('Alibaba'))).toBe(true);
    });
  });
});
