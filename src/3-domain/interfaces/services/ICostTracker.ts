/**
 * Cost Tracker Interface
 *
 * AI maliyet takibi için interface
 */

import { Result } from '@/6-core/result/Result';
import { AIProvider, AIUseCase } from '@/3-domain/enums/AIEnums';

export interface ICostTracker {
  /**
   * Token sayısına göre maliyet hesapla
   */
  calculateCost(
    provider: AIProvider,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number;

  /**
   * Toplam maliyeti getir
   */
  getTotalCost(filter?: {
    provider?: AIProvider;
    useCase?: AIUseCase;
    userId?: string;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Result<number>>;

  /**
   * Maliyet istatistiklerini getir
   */
  getCostStats(filter?: {
    provider?: AIProvider;
    useCase?: AIUseCase;
    userId?: string;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<
    Result<{
      totalCost: number;
      costByProvider: Record<AIProvider, number>;
      costByUseCase: Record<AIUseCase, number>;
      averageCostPerRequest: number;
      dailyCosts: Array<{ date: string; cost: number }>;
    }>
  >;
}
