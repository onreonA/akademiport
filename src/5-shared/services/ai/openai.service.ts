/**
 * OpenAI Service
 *
 * OpenAI GPT-4 ve GPT-3.5-turbo entegrasyonu
 */

import OpenAI from 'openai';
import { IAIService } from '@/3-domain/interfaces/services/IAIService';
import { AIProvider, AIModel, AIRequestStatus } from '@/3-domain/enums/AIEnums';
import { AIRequestOptions, AIResponse, AIError } from '@/3-domain/entities/AI';
import { Result } from '@/6-core/result/Result';
import { aiConfig, modelPricing } from '@/4-infrastructure/config/ai.config';
import { logger } from '@/5-shared/utils/logger';
import { withRetry, toAIError } from './retry-handler';
import { rateLimiter } from './rate-limiter';

export class OpenAIService implements IAIService {
  private client: OpenAI;
  private defaultModel: AIModel;

  constructor(defaultModel: AIModel = AIModel.GPT_4) {
    if (!aiConfig.openai.apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    this.client = new OpenAI({
      apiKey: aiConfig.openai.apiKey,
      baseURL: aiConfig.openai.baseURL,
    });
    this.defaultModel = defaultModel;
  }

  async complete(prompt: string, options?: AIRequestOptions): Promise<Result<AIResponse, AIError>> {
    // Rate limit kontrolü
    const canProceed = await rateLimiter.checkAllRateLimits(AIProvider.OPENAI);
    if (!canProceed) {
      return Result.fail({
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryable: true,
      });
    }

    const startTime = Date.now();
    const model = options?.metadata?.model || this.defaultModel;

    try {
      const response = await withRetry(
        () =>
          this.client.chat.completions.create({
            model: this.mapModelToOpenAI(model),
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 2000,
            top_p: options?.topP ?? 1.0,
          }),
        {
          maxRetries: 3,
          initialDelayMs: 1000,
        }
      );

      const durationMs = Date.now() - startTime;
      const requestTokens = response.usage?.prompt_tokens || 0;
      const responseTokens = response.usage?.completion_tokens || 0;
      const totalTokens = response.usage?.total_tokens || 0;
      const text = response.choices[0]?.message?.content || '';

      const costUsd = this.calculateCost(model, requestTokens, responseTokens);

      return Result.ok({
        text,
        requestTokens,
        responseTokens,
        totalTokens,
        costUsd,
        durationMs,
        model,
        provider: AIProvider.OPENAI,
      });
    } catch (error: any) {
      logger.error('OpenAI API error:', error);

      const aiError = toAIError(error, this.isRetryableError(error));
      return Result.fail(aiError);
    }
  }

  async stream(
    prompt: string,
    options?: AIRequestOptions,
    onChunk?: (chunk: string) => void
  ): Promise<Result<AIResponse, AIError>> {
    const startTime = Date.now();
    const model = options?.metadata?.model || this.defaultModel;
    let fullText = '';
    let requestTokens = 0;
    let responseTokens = 0;

    try {
      const stream = await this.client.chat.completions.create({
        model: this.mapModelToOpenAI(model),
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        top_p: options?.topP ?? 1.0,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          onChunk?.(content);
        }

        // Token bilgisi stream'in sonunda gelir
        if (chunk.usage) {
          requestTokens = chunk.usage.prompt_tokens || 0;
          responseTokens = chunk.usage.completion_tokens || 0;
        }
      }

      const durationMs = Date.now() - startTime;
      const totalTokens = requestTokens + responseTokens;
      const costUsd = this.calculateCost(model, requestTokens, responseTokens);

      return Result.ok({
        text: fullText,
        requestTokens,
        responseTokens,
        totalTokens,
        costUsd,
        durationMs,
        model,
        provider: AIProvider.OPENAI,
      });
    } catch (error: any) {
      logger.error('OpenAI streaming error:', error);

      const aiError: AIError = {
        message: error.message || 'OpenAI streaming error',
        code: error.code || error.status?.toString(),
        status: error.status,
        retryable: this.isRetryableError(error),
      };

      return Result.fail(aiError);
    }
  }

  getProvider(): AIProvider {
    return AIProvider.OPENAI;
  }

  getDefaultModel(): AIModel {
    return this.defaultModel;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple health check - try to list models
      await this.client.models.list();
      return true;
    } catch (error) {
      logger.error('OpenAI availability check failed:', error);
      return false;
    }
  }

  /**
   * Model enum'ını OpenAI model string'ine çevir
   */
  private mapModelToOpenAI(model: AIModel): string {
    const modelMap: Record<AIModel, string> = {
      [AIModel.GPT_4]: 'gpt-4',
      [AIModel.GPT_4_TURBO]: 'gpt-4-turbo-preview',
      [AIModel.GPT_3_5_TURBO]: 'gpt-3.5-turbo',
      [AIModel.CLAUDE_OPUS]: 'gpt-4', // Fallback
      [AIModel.CLAUDE_SONNET]: 'gpt-4', // Fallback
      [AIModel.CLAUDE_HAIKU]: 'gpt-3.5-turbo', // Fallback
    };

    return modelMap[model] || 'gpt-4';
  }

  /**
   * Maliyet hesapla
   */
  private calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
    const pricing = modelPricing[model];
    if (!pricing) {
      return 0;
    }

    const inputCost = (inputTokens / 1_000_000) * pricing.inputPrice;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputPrice;

    return inputCost + outputCost;
  }

  /**
   * Hata retry edilebilir mi?
   */
  private isRetryableError(error: any): boolean {
    // Rate limit, timeout, server errors retry edilebilir
    if (error.status === 429 || error.status === 503 || error.status === 504) {
      return true;
    }

    // Network errors retry edilebilir
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }

    return false;
  }
}
