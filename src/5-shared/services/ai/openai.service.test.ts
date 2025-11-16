import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAIService } from './openai.service';
import { AIModel, AIProvider } from '@/3-domain/enums/AIEnums';

// Mock OpenAI SDK
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Test response' } }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
          }),
        },
      };
      models = {
        list: vi.fn().mockResolvedValue({ data: [] }),
      };
    },
  };
});

// Mock rate limiter
vi.mock('./rate-limiter', () => ({
  rateLimiter: {
    checkAllRateLimits: vi.fn().mockResolvedValue(true),
  },
}));

// Mock ai config - always return test key
vi.mock('@/4-infrastructure/config/ai.config', () => ({
  aiConfig: {
    openai: {
      apiKey: 'test-key',
      baseURL: 'https://api.openai.com/v1',
    },
  },
  modelPricing: {},
}));

describe('OpenAIService', () => {
  describe('constructor', () => {
    it('should create service with default model', () => {
      const service = new OpenAIService();
      expect(service.getDefaultModel()).toBe(AIModel.GPT_4);
    });

    it('should create service with custom model', () => {
      const service = new OpenAIService(AIModel.GPT_3_5_TURBO);
      expect(service.getDefaultModel()).toBe(AIModel.GPT_3_5_TURBO);
    });
  });

  describe('getProvider', () => {
    it('should return OpenAI provider', () => {
      const service = new OpenAIService();
      expect(service.getProvider()).toBe(AIProvider.OPENAI);
    });
  });
});
