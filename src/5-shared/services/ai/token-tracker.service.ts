/**
 * Token Tracker Service
 *
 * Token kullanım takibi ve istatistikler
 */

import { createClient } from '@/4-infrastructure/database/supabase-server';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { AIUsageLog } from '@/3-domain/entities/AI';
import { AIProvider, AIUseCase } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { logger } from '@/5-shared/utils/logger';

export class TokenTrackerService implements ITokenTracker {
  async logUsage(log: Omit<AIUsageLog, 'id' | 'createdAt'>): Promise<Result<AIUsageLog>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .insert({
          user_id: log.userId,
          company_id: log.companyId,
          program_id: log.programId,
          provider: log.provider,
          model: log.model,
          use_case: log.useCase,
          prompt_id: log.promptId,
          prompt_version: log.promptVersion,
          request_text: log.requestText,
          response_text: log.responseText,
          request_tokens: log.requestTokens,
          response_tokens: log.responseTokens,
          total_tokens: log.totalTokens,
          cost_usd: log.costUsd,
          status: log.status,
          error_message: log.errorMessage,
          error_code: log.errorCode,
          duration_ms: log.durationMs,
          metadata: log.metadata,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to log usage:', error);
        return Result.fail(new Error(`Failed to log usage: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('Error in logUsage:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getTotalTokens(filter?: {
    provider?: AIProvider;
    useCase?: AIUseCase;
    userId?: string;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Result<number>> {
    try {
      const supabase = await createClient();

      let query = supabase
        .from('ai_usage_logs')
        .select('total_tokens', { count: 'exact', head: true });

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

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to get total tokens:', error);
        return Result.fail(new Error(`Failed to get total tokens: ${error.message}`));
      }

      // Supabase count doesn't return sum, we need to fetch and sum
      const { data: logs, error: fetchError } = await supabase
        .from('ai_usage_logs')
        .select('total_tokens');

      if (fetchError) {
        logger.error('Failed to fetch tokens:', fetchError);
        return Result.fail(new Error(`Failed to fetch tokens: ${fetchError.message}`));
      }

      const total = logs?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0;

      return Result.ok(total);
    } catch (error) {
      logger.error('Error in getTotalTokens:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getUsageStats(filter?: {
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
  > {
    try {
      const supabase = await createClient();

      let query = supabase.from('ai_usage_logs').select('*');

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
        logger.error('Failed to get usage stats:', error);
        return Result.fail(new Error(`Failed to get usage stats: ${error.message}`));
      }

      const logs = data || [];
      const totalRequests = logs.length;
      const totalTokens = logs.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
      const averageTokensPerRequest = totalRequests > 0 ? totalTokens / totalRequests : 0;

      const requestsByProvider: Record<AIProvider, number> = {
        [AIProvider.OPENAI]: 0,
        [AIProvider.CLAUDE]: 0,
      };

      const requestsByUseCase: Record<AIUseCase, number> = {
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

      for (const log of logs) {
        if (log.provider) {
          requestsByProvider[log.provider as AIProvider] =
            (requestsByProvider[log.provider as AIProvider] || 0) + 1;
        }
        if (log.use_case) {
          requestsByUseCase[log.use_case as AIUseCase] =
            (requestsByUseCase[log.use_case as AIUseCase] || 0) + 1;
        }
      }

      return Result.ok({
        totalRequests,
        totalTokens,
        averageTokensPerRequest,
        requestsByProvider,
        requestsByUseCase,
      });
    } catch (error) {
      logger.error('Error in getUsageStats:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Database row'u entity'ye map et
   */
  private mapToEntity(row: any): AIUsageLog {
    return {
      id: row.id,
      userId: row.user_id,
      companyId: row.company_id,
      programId: row.program_id,
      provider: row.provider,
      model: row.model,
      useCase: row.use_case,
      promptId: row.prompt_id,
      promptVersion: row.prompt_version,
      requestText: row.request_text,
      responseText: row.response_text,
      requestTokens: row.request_tokens,
      responseTokens: row.response_tokens,
      totalTokens: row.total_tokens,
      costUsd: row.cost_usd,
      status: row.status,
      errorMessage: row.error_message,
      errorCode: row.error_code,
      durationMs: row.duration_ms,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
    };
  }
}
