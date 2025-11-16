/**
 * Token Tracker Interface
 *
 * Token kullanım takibi için interface
 */

import { Result } from '@/6-core/result/Result';
import { AIUsageLog } from '@/3-domain/entities/AI';
import { AIProvider, AIUseCase } from '@/3-domain/enums/AIEnums';

export interface ITokenTracker {
  /**
   * Token kullanımını logla
   */
  logUsage(log: Omit<AIUsageLog, 'id' | 'createdAt'>): Promise<Result<AIUsageLog>>;

  /**
   * Toplam token kullanımını getir
   */
  getTotalTokens(filter?: {
    provider?: AIProvider;
    useCase?: AIUseCase;
    userId?: string;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Result<number>>;

  /**
   * Token kullanım istatistiklerini getir
   */
  getUsageStats(filter?: {
    provider?: AIProvider;
    useCase?: AIUseCase;
    userId?: string;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<
    Result<{
      totalRequests: number;
      totalTokens: number;
      averageTokensPerRequest: number;
      requestsByProvider: Record<AIProvider, number>;
      requestsByUseCase: Record<AIUseCase, number>;
    }>
  >;
}
