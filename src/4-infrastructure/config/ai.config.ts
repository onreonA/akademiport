/**
 * AI Configuration
 *
 * AI servisleri için konfigürasyon dosyası
 */

import { AIProvider, AIModel } from '@/3-domain/enums/AIEnums';

/**
 * Environment Variables
 */
export const aiConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
  },
} as const;

/**
 * Model Pricing (USD per 1M tokens)
 * Güncel fiyatlar: https://openai.com/pricing, https://www.anthropic.com/pricing
 */
export const modelPricing: Record<AIModel, { inputPrice: number; outputPrice: number }> = {
  // OpenAI Models
  [AIModel.GPT_4]: {
    inputPrice: 30.0, // $30 per 1M input tokens
    outputPrice: 60.0, // $60 per 1M output tokens
  },
  [AIModel.GPT_4_TURBO]: {
    inputPrice: 10.0, // $10 per 1M input tokens
    outputPrice: 30.0, // $30 per 1M output tokens
  },
  [AIModel.GPT_3_5_TURBO]: {
    inputPrice: 1.5, // $1.5 per 1M input tokens
    outputPrice: 2.0, // $2 per 1M output tokens
  },
  // Claude Models
  [AIModel.CLAUDE_OPUS]: {
    inputPrice: 15.0, // $15 per 1M input tokens
    outputPrice: 75.0, // $75 per 1M output tokens
  },
  [AIModel.CLAUDE_SONNET]: {
    inputPrice: 3.0, // $3 per 1M input tokens
    outputPrice: 15.0, // $15 per 1M output tokens
  },
  [AIModel.CLAUDE_HAIKU]: {
    inputPrice: 0.25, // $0.25 per 1M input tokens
    outputPrice: 1.25, // $1.25 per 1M output tokens
  },
};

/**
 * Default Rate Limits (per provider)
 */
export const defaultRateLimits: Record<
  AIProvider,
  {
    perMinute: number;
    perHour: number;
    perDay: number;
    timeoutMs: number;
    maxRetries: number;
  }
> = {
  [AIProvider.OPENAI]: {
    perMinute: 60,
    perHour: 1000,
    perDay: 10000,
    timeoutMs: 30000, // 30 seconds
    maxRetries: 3,
  },
  [AIProvider.CLAUDE]: {
    perMinute: 50,
    perHour: 800,
    perDay: 8000,
    timeoutMs: 60000, // 60 seconds
    maxRetries: 3,
  },
};

/**
 * Environment variable validation
 */
if (!aiConfig.openai.apiKey && process.env.NODE_ENV === 'production') {
  console.warn('Warning: OPENAI_API_KEY is not set');
}

if (!aiConfig.claude.apiKey && process.env.NODE_ENV === 'production') {
  console.warn('Warning: ANTHROPIC_API_KEY is not set');
}
