/**
 * AI Service Interface
 *
 * AI servisleri için temel interface
 */

import { Result } from '@/6-core/result/Result';
import { AIRequestOptions, AIResponse, AIError } from '@/3-domain/entities/AI';
import { AIProvider, AIModel } from '@/3-domain/enums/AIEnums';

export interface IAIService {
  /**
   * Text completion (chat completion)
   */
  complete(prompt: string, options?: AIRequestOptions): Promise<Result<AIResponse>>;

  /**
   * Streaming text completion
   */
  stream(
    prompt: string,
    options?: AIRequestOptions,
    onChunk?: (chunk: string) => void
  ): Promise<Result<AIResponse>>;

  /**
   * Get provider name
   */
  getProvider(): AIProvider;

  /**
   * Get default model
   */
  getDefaultModel(): AIModel;

  /**
   * Check if service is available
   */
  isAvailable(): Promise<boolean>;
}
