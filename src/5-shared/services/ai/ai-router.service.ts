/**
 * AI Router Service
 *
 * Use case bazlı provider seçimi ve routing
 */

import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IAIService } from '@/3-domain/interfaces/services/IAIService';
import { AIProvider, AIUseCase, AI_PROVIDER_MAP } from '@/3-domain/enums/AIEnums';
import { AIRequestOptions, AIResponse, AIError } from '@/3-domain/entities/AI';
import { Result } from '@/6-core/result/Result';
import { OpenAIService } from './openai.service';
import { ClaudeService } from './claude.service';
import { logger } from '@/5-shared/utils/logger';

export class AIRouterService implements IAIRouter {
  private openaiService: OpenAIService;
  private claudeService: ClaudeService;
  private providerHealthCache: Map<AIProvider, { isHealthy: boolean; lastCheck: number }> =
    new Map();
  private healthCheckTTL = 60000; // 1 minute

  constructor() {
    try {
      this.openaiService = new OpenAIService();
    } catch (error) {
      logger.warn('OpenAI service initialization failed:', error);
    }

    try {
      this.claudeService = new ClaudeService();
    } catch (error) {
      logger.warn('Claude service initialization failed:', error);
    }
  }

  async complete(
    useCase: AIUseCase,
    prompt: string,
    options?: AIRequestOptions
  ): Promise<Result<AIResponse, AIError>> {
    const providerResult = this.selectProvider(useCase);
    if (providerResult.isFailure) {
      return Result.fail({
        message: providerResult.error?.message || 'Provider selection failed',
        retryable: false,
      });
    }

    const provider = providerResult.value;
    const service = this.getService(provider);

    if (!service) {
      return Result.fail({
        message: `Service not available for provider: ${provider}`,
        retryable: false,
      });
    }

    // Health check (cached)
    const isHealthy = await this.checkProviderHealth(provider);
    if (!isHealthy) {
      // Fallback to other provider
      const fallbackProvider =
        provider === AIProvider.OPENAI ? AIProvider.CLAUDE : AIProvider.OPENAI;
      const fallbackService = this.getService(fallbackProvider);

      if (fallbackService) {
        logger.warn(`Provider ${provider} is unhealthy, falling back to ${fallbackProvider}`);
        return fallbackService.complete(prompt, {
          ...options,
          metadata: {
            ...options?.metadata,
            model: AI_PROVIDER_MAP[useCase].model,
            fallback: true,
          },
        });
      }
    }

    return service.complete(prompt, {
      ...options,
      metadata: {
        ...options?.metadata,
        model: AI_PROVIDER_MAP[useCase].model,
      },
    });
  }

  async stream(
    useCase: AIUseCase,
    prompt: string,
    options?: AIRequestOptions,
    onChunk?: (chunk: string) => void
  ): Promise<Result<AIResponse, AIError>> {
    const providerResult = this.selectProvider(useCase);
    if (providerResult.isFailure) {
      return Result.fail({
        message: providerResult.error?.message || 'Provider selection failed',
        retryable: false,
      });
    }

    const provider = providerResult.value;
    const service = this.getService(provider);

    if (!service) {
      return Result.fail({
        message: `Service not available for provider: ${provider}`,
        retryable: false,
      });
    }

    return service.stream(
      prompt,
      {
        ...options,
        metadata: {
          ...options?.metadata,
          model: AI_PROVIDER_MAP[useCase].model,
        },
      },
      onChunk
    );
  }

  selectProvider(useCase: AIUseCase): Result<AIProvider> {
    const mapping = AI_PROVIDER_MAP[useCase];
    if (!mapping) {
      return Result.fail(new Error(`No provider mapping for use case: ${useCase}`));
    }

    return Result.ok(mapping.provider);
  }

  async checkProviderHealth(provider: AIProvider): Promise<boolean> {
    // Check cache first
    const cached = this.providerHealthCache.get(provider);
    if (cached && Date.now() - cached.lastCheck < this.healthCheckTTL) {
      return cached.isHealthy;
    }

    const service = this.getService(provider);
    if (!service) {
      this.providerHealthCache.set(provider, { isHealthy: false, lastCheck: Date.now() });
      return false;
    }

    try {
      const isHealthy = await service.isAvailable();
      this.providerHealthCache.set(provider, { isHealthy, lastCheck: Date.now() });
      return isHealthy;
    } catch (error) {
      logger.error(`Health check failed for ${provider}:`, error);
      this.providerHealthCache.set(provider, { isHealthy: false, lastCheck: Date.now() });
      return false;
    }
  }

  /**
   * Provider'a göre service instance'ı getir
   */
  private getService(provider: AIProvider): IAIService | null {
    switch (provider) {
      case AIProvider.OPENAI:
        return this.openaiService || null;
      case AIProvider.CLAUDE:
        return this.claudeService || null;
      default:
        return null;
    }
  }
}
