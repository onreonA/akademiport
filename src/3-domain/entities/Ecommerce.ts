/**
 * E-commerce Metrics Entity
 *
 * Domain entity for E-commerce metrics
 */

import { EcommercePlatformType } from '../enums/EcommerceEnums';

export interface EcommerceMetrics {
  id: string;
  companyId: string;
  programId: string;
  periodYear: number;
  periodMonth: number;
  platformType: EcommercePlatformType;

  // Alibaba (B2B) Metrikleri
  alibabaVisitors: number;
  alibabaProducts: number;
  alibabaRfqCount: number;
  alibabaOrders: number;
  alibabaRevenue: number;

  // B2C Platform Metrikleri
  b2cVisitors: number;
  b2cProducts: number;
  b2cOrders: number;
  b2cRevenue: number;

  // Genel Metrikler (Toplam)
  totalVisitors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;

  // Ek bilgiler
  notes?: string | null;
  metadata?: Record<string, unknown> | null;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
}

export interface EcommercePerformance {
  companyId: string;
  companyName: string;
  programId: string;
  programName: string;

  // Toplam metrikler (tüm zamanlar)
  totalVisitorsAllTime: number;
  totalProductsAllTime: number;
  totalOrdersAllTime: number;
  totalRevenueAllTime: number;

  // Son 3 ay metrikleri
  visitorsLast3Months: number;
  ordersLast3Months: number;
  revenueLast3Months: number;

  // Son ay metrikleri
  visitorsLastMonth: number;
  ordersLastMonth: number;
  revenueLastMonth: number;

  // Platform bazlı toplamlar
  alibabaRevenueTotal: number;
  b2cRevenueTotal: number;

  // Ortalama metrikler
  avgMonthlyRevenue: number;

  // Trend
  revenueGrowthPercentage: number;

  // Son güncelleme
  lastUpdatedAt: Date | null;
  lastPeriod: string | null;
}

/**
 * E-commerce Metrics Entity with Business Logic
 */
export class EcommerceMetricsEntity implements EcommerceMetrics {
  id!: string;
  companyId!: string;
  programId!: string;
  periodYear!: number;
  periodMonth!: number;
  platformType!: EcommercePlatformType;
  alibabaVisitors!: number;
  alibabaProducts!: number;
  alibabaRfqCount!: number;
  alibabaOrders!: number;
  alibabaRevenue!: number;
  b2cVisitors!: number;
  b2cProducts!: number;
  b2cOrders!: number;
  b2cRevenue!: number;
  totalVisitors!: number;
  totalProducts!: number;
  totalOrders!: number;
  totalRevenue!: number;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy?: string | null;

  constructor(data: EcommerceMetrics) {
    Object.assign(this, data);
  }

  /**
   * Geçerli bir dönem mi?
   */
  isValidPeriod(): boolean {
    return (
      this.periodYear >= 2020 &&
      this.periodYear <= 2100 &&
      this.periodMonth >= 1 &&
      this.periodMonth <= 12
    );
  }

  /**
   * Metrikler geçerli mi?
   */
  isValidMetrics(): boolean {
    return (
      this.alibabaVisitors >= 0 &&
      this.alibabaProducts >= 0 &&
      this.alibabaOrders >= 0 &&
      this.alibabaRevenue >= 0 &&
      this.b2cVisitors >= 0 &&
      this.b2cProducts >= 0 &&
      this.b2cOrders >= 0 &&
      this.b2cRevenue >= 0 &&
      this.totalVisitors >= 0 &&
      this.totalProducts >= 0 &&
      this.totalOrders >= 0 &&
      this.totalRevenue >= 0
    );
  }

  /**
   * Toplam metrikleri hesapla
   */
  calculateTotals(): void {
    if (this.platformType === EcommercePlatformType.ALIBABA) {
      this.totalVisitors = this.alibabaVisitors;
      this.totalProducts = this.alibabaProducts;
      this.totalOrders = this.alibabaOrders;
      this.totalRevenue = this.alibabaRevenue;
    } else {
      this.totalVisitors = this.b2cVisitors;
      this.totalProducts = this.b2cProducts;
      this.totalOrders = this.b2cOrders;
      this.totalRevenue = this.b2cRevenue;
    }
  }

  /**
   * Validation
   */
  static validate(data: Partial<EcommerceMetrics>): string[] {
    const errors: string[] = [];

    if (!data.companyId) {
      errors.push('Firma ID gereklidir');
    }

    if (!data.programId) {
      errors.push('Program ID gereklidir');
    }

    if (!data.periodYear || data.periodYear < 2020 || data.periodYear > 2100) {
      errors.push('Geçerli bir yıl gereklidir (2020-2100)');
    }

    if (!data.periodMonth || data.periodMonth < 1 || data.periodMonth > 12) {
      errors.push('Geçerli bir ay gereklidir (1-12)');
    }

    if (!data.platformType) {
      errors.push('Platform tipi gereklidir');
    }

    if (data.alibabaVisitors !== undefined && data.alibabaVisitors < 0) {
      errors.push('Alibaba ziyaretçi sayısı negatif olamaz');
    }

    if (data.b2cVisitors !== undefined && data.b2cVisitors < 0) {
      errors.push('B2C ziyaretçi sayısı negatif olamaz');
    }

    if (data.alibabaRevenue !== undefined && data.alibabaRevenue < 0) {
      errors.push('Alibaba geliri negatif olamaz');
    }

    if (data.b2cRevenue !== undefined && data.b2cRevenue < 0) {
      errors.push('B2C geliri negatif olamaz');
    }

    return errors;
  }
}
