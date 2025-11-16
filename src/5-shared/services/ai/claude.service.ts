/**
 * Claude Service
 *
 * Anthropic Claude entegrasyonu
 */

import Anthropic from '@anthropic-ai/sdk';
import { IAIService } from '@/3-domain/interfaces/services/IAIService';
import { AIProvider, AIModel, AIRequestStatus } from '@/3-domain/enums/AIEnums';
import { AIRequestOptions, AIResponse, AIError } from '@/3-domain/entities/AI';
import { Result } from '@/6-core/result/Result';
import { aiConfig, modelPricing } from '@/4-infrastructure/config/ai.config';
import { logger } from '@/5-shared/utils/logger';
import { withRetry, toAIError } from './retry-handler';
import { rateLimiter } from './rate-limiter';

export class ClaudeService implements IAIService {
  private client: Anthropic;
  private defaultModel: AIModel;

  constructor(defaultModel: AIModel = AIModel.CLAUDE_SONNET) {
    if (!aiConfig.claude.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    this.client = new Anthropic({
      apiKey: aiConfig.claude.apiKey,
      baseURL: aiConfig.claude.baseURL,
    });
    this.defaultModel = defaultModel;
  }

  async complete(prompt: string, options?: AIRequestOptions): Promise<Result<AIResponse, AIError>> {
    // Rate limit kontrolü
    const canProceed = await rateLimiter.checkAllRateLimits(AIProvider.CLAUDE);
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
          this.client.messages.create({
            model: this.mapModelToClaude(model),
            max_tokens: options?.maxTokens ?? 2000,
            temperature: options?.temperature ?? 0.7,
            top_p: options?.topP ?? 1.0,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        {
          maxRetries: 3,
          initialDelayMs: 1000,
        }
      );

      const durationMs = Date.now() - startTime;
      const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
      const requestTokens = response.usage.input_tokens || 0;
      const responseTokens = response.usage.output_tokens || 0;
      const totalTokens = requestTokens + responseTokens;

      const costUsd = this.calculateCost(model, requestTokens, responseTokens);

      return Result.ok({
        text,
        requestTokens,
        responseTokens,
        totalTokens,
        costUsd,
        durationMs,
        model,
        provider: AIProvider.CLAUDE,
      });
    } catch (error: any) {
      logger.error('Claude API error:', error);

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
      const stream = await this.client.messages.create({
        model: this.mapModelToClaude(model),
        max_tokens: options?.maxTokens ?? 2000,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP ?? 1.0,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const content = chunk.delta.text || '';
          fullText += content;
          onChunk?.(content);
        }

        // Token bilgisi stream'in sonunda gelir
        if (chunk.type === 'message_stop') {
          // Token bilgisi message_stop'ta gelmez, message_delta'da gelir
        }

        if (chunk.type === 'message_delta') {
          requestTokens = chunk.usage?.input_tokens || requestTokens;
          responseTokens = chunk.usage?.output_tokens || responseTokens;
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
        provider: AIProvider.CLAUDE,
      });
    } catch (error: any) {
      logger.error('Claude streaming error:', error);

      const aiError: AIError = {
        message: error.message || 'Claude streaming error',
        code: error.status?.toString(),
        status: error.status,
        retryable: this.isRetryableError(error),
      };

      return Result.fail(aiError);
    }
  }

  getProvider(): AIProvider {
    return AIProvider.CLAUDE;
  }

  getDefaultModel(): AIModel {
    return this.defaultModel;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple health check - try a minimal request
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'test',
          },
        ],
      });
      return true;
    } catch (error: any) {
      // 401/403 gibi auth hataları availability değil, config hatası
      if (error.status === 401 || error.status === 403) {
        return false;
      }
      // Diğer hatalar geçici olabilir
      logger.error('Claude availability check failed:', error);
      return false;
    }
  }

  /**
   * Model enum'ını Claude model string'ine çevir
   */
  private mapModelToClaude(model: AIModel): string {
    const modelMap: Record<AIModel, string> = {
      [AIModel.CLAUDE_OPUS]: 'claude-3-opus-20240229',
      [AIModel.CLAUDE_SONNET]: 'claude-3-sonnet-20240229',
      [AIModel.CLAUDE_HAIKU]: 'claude-3-haiku-20240307',
      [AIModel.GPT_4]: 'claude-3-opus-20240229', // Fallback
      [AIModel.GPT_4_TURBO]: 'claude-3-sonnet-20240229', // Fallback
      [AIModel.GPT_3_5_TURBO]: 'claude-3-haiku-20240307', // Fallback
    };

    return modelMap[model] || 'claude-3-sonnet-20240229';
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
