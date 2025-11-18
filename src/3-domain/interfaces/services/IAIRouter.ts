/**
 * AI Router Interface
 *
 * Use case bazlı provider seçimi için router interface
 */

import { Result } from '@/6-core/result/Result';
import { AIRequestOptions, AIResponse, AIError } from '@/3-domain/entities/AI';
import { AIUseCase, AIProvider } from '@/3-domain/enums/AIEnums';

export interface IAIRouter {
  /**
   * Use case'e göre AI servisi ile completion yap
   */
  complete(
    useCase: AIUseCase,
    prompt: string,
    options?: AIRequestOptions
  ): Promise<Result<AIResponse>>;

  /**
   * Use case'e göre AI servisi ile streaming completion yap
   */
  stream(
    useCase: AIUseCase,
    prompt: string,
    options?: AIRequestOptions,
    onChunk?: (chunk: string) => void
  ): Promise<Result<AIResponse>>;

  /**
   * Use case için provider seç
   */
  selectProvider(useCase: AIUseCase): Result<AIProvider>;

  /**
   * Provider health check
   */
  checkProviderHealth(provider: AIProvider): Promise<boolean>;
}
