/**
 * Cost Tracker Service
 *
 * AI maliyet takibi ve istatistikler
 */

import { createClient } from '@/4-infrastructure/database/supabase-server';
import { ICostTracker } from '@/3-domain/interfaces/services/ICostTracker';
import { AIProvider, AIUseCase } from '@/3-domain/enums/AIEnums';
import { modelPricing } from '@/4-infrastructure/config/ai.config';
import { Result } from '@/6-core/result/Result';
import { logger } from '@/5-shared/utils/logger';

export class CostTrackerService implements ICostTracker {
  calculateCost(
    provider: AIProvider,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    // Model string'ini AIModel enum'una çevir
    const modelEnum = this.mapStringToModel(model, provider);
    const pricing = (modelPricing as Record<string, { inputPrice: number; outputPrice: number }>)[
      modelEnum
    ];

    if (!pricing) {
      logger.warn(`No pricing found for model: ${model}`);
      return 0;
    }

    const inputCost = (inputTokens / 1_000_000) * pricing.inputPrice;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputPrice;

    return inputCost + outputCost;
  }

  async getTotalCost(filter?: {
    provider?: AIProvider;
    useCase?: AIUseCase;
    userId?: string;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Result<number>> {
    try {
      const supabase = await createClient();

      let query = supabase.from('ai_usage_logs').select('cost_usd');

      if (filter?.provider) {
        query = query.eq('provider', filter.provider);
      }
      if (filter?.useCase) {
        query = query.eq('use_case', filter.useCase);
      }
      if (filter?.userId) {
        query = query.eq('user_id', filter.userId);
      }
      if (filter?.companyId) {
        query = query.eq('company_id', filter.companyId);
      }
      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate.toISOString());
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get total cost:', error);
        return Result.fail(new Error(`Failed to get total cost: ${error.message}`));
      }

      const total = data?.reduce((sum, log) => sum + (log.cost_usd || 0), 0) || 0;

      return Result.ok(total);
    } catch (error) {
      logger.error('Error in getTotalCost:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getCostStats(filter?: {
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
  > {
    try {
      const supabase = await createClient();

      let query = supabase.from('ai_usage_logs').select('cost_usd, provider, use_case, created_at');

      if (filter?.provider) {
        query = query.eq('provider', filter.provider);
      }
      if (filter?.useCase) {
        query = query.eq('use_case', filter.useCase);
      }
      if (filter?.userId) {
        query = query.eq('user_id', filter.userId);
      }
      if (filter?.companyId) {
        query = query.eq('company_id', filter.companyId);
      }
      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate.toISOString());
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get cost stats:', error);
        return Result.fail(new Error(`Failed to get cost stats: ${error.message}`));
      }

      const logs = data || [];
      const totalCost = logs.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
      const averageCostPerRequest = logs.length > 0 ? totalCost / logs.length : 0;

      const costByProvider: Record<AIProvider, number> = {
        [AIProvider.OPENAI]: 0,
        [AIProvider.CLAUDE]: 0,
      };

      const costByUseCase: Record<AIUseCase, number> = {
        [AIUseCase.TASK_DESCRIPTION]: 0,
        [AIUseCase.REPORT_GENERATION]: 0,
        [AIUseCase.NEWS_REWRITE]: 0,
        [AIUseCase.FORUM_MODERATION]: 0,
        [AIUseCase.CV_ANALYSIS]: 0,
        [AIUseCase.DOCUMENT_SUMMARY]: 0,
        [AIUseCase.CHATBOT]: 0,
        [AIUseCase.RISK_ANALYSIS]: 0,
        [AIUseCase.SUCCESS_PREDICTION]: 0,
        [AIUseCase.TREND_ANALYSIS]: 0,
        [AIUseCase.CONTENT_GENERATION]: 0,
        [AIUseCase.OTHER]: 0,
      };

      const dailyCostsMap: Map<string, number> = new Map();

      for (const log of logs) {
        const cost = log.cost_usd || 0;

        if (log.provider) {
          costByProvider[log.provider as AIProvider] =
            (costByProvider[log.provider as AIProvider] || 0) + cost;
        }

        if (log.use_case) {
          costByUseCase[log.use_case as AIUseCase] =
            (costByUseCase[log.use_case as AIUseCase] || 0) + cost;
        }

        // Daily costs
        if (log.created_at) {
          const date = new Date(log.created_at).toISOString().split('T')[0];
          dailyCostsMap.set(date, (dailyCostsMap.get(date) || 0) + cost);
        }
      }

      const dailyCosts = Array.from(dailyCostsMap.entries())
        .map(([date, cost]) => ({ date, cost }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return Result.ok({
        totalCost,
        costByProvider,
        costByUseCase,
        averageCostPerRequest,
        dailyCosts,
      });
    } catch (error) {
      logger.error('Error in getCostStats:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Model string'ini AIModel enum'una çevir
   */
  private mapStringToModel(model: string, provider: AIProvider): any {
    // OpenAI models
    if (model.includes('gpt-4-turbo') || model.includes('gpt-4-turbo-preview')) {
      return 'gpt-4-turbo';
    }
    if (model.includes('gpt-4')) {
      return 'gpt-4';
    }
    if (model.includes('gpt-3.5')) {
      return 'gpt-3.5-turbo';
    }

    // Claude models
    if (model.includes('claude-3-opus')) {
      return 'claude-opus';
    }
    if (model.includes('claude-3-sonnet')) {
      return 'claude-sonnet';
    }
    if (model.includes('claude-3-haiku')) {
      return 'claude-haiku';
    }

    // Default fallback
    return provider === AIProvider.OPENAI ? 'gpt-4' : 'claude-sonnet';
  }
}
