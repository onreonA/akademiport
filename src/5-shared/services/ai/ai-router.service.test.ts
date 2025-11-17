import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIRouterService } from './ai-router.service';
import { AIUseCase, AIProvider } from '@/3-domain/enums/AIEnums';

// Mock services - must be inside factory function
vi.mock('./openai.service', () => {
  class MockOpenAIService {
    getProvider() {
      return 'openai';
    }
    getDefaultModel() {
      return 'gpt-4';
    }
    async isAvailable() {
      return true;
    }
  }
  return {
    OpenAIService: MockOpenAIService,
  };
});

vi.mock('./claude.service', () => {
  class MockClaudeService {
    getProvider() {
      return 'claude';
    }
    getDefaultModel() {
      return 'claude-sonnet';
    }
    async isAvailable() {
      return true;
    }
  }
  return {
    ClaudeService: MockClaudeService,
  };
});

describe('AIRouterService', () => {
  let router: AIRouterService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    router = new AIRouterService();
  });

  describe('selectProvider', () => {
    it('should select OpenAI for task_description', () => {
      const result = router.selectProvider(AIUseCase.TASK_DESCRIPTION);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(AIProvider.OPENAI);
    });

    it('should select Claude for report_generation', () => {
      const result = router.selectProvider(AIUseCase.REPORT_GENERATION);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(AIProvider.CLAUDE);
    });

    it('should select OpenAI for chatbot', () => {
      const result = router.selectProvider(AIUseCase.CHATBOT);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(AIProvider.OPENAI);
    });

    it('should select Claude for risk_analysis', () => {
      const result = router.selectProvider(AIUseCase.RISK_ANALYSIS);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(AIProvider.CLAUDE);
    });

    it('should select Claude for document_summary', () => {
      const result = router.selectProvider(AIUseCase.DOCUMENT_SUMMARY);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(AIProvider.CLAUDE);
    });
  });

  describe('checkProviderHealth', () => {
    it('should check OpenAI health', async () => {
      const isHealthy = await router.checkProviderHealth(AIProvider.OPENAI);
      expect(typeof isHealthy).toBe('boolean');
    });

    it('should check Claude health', async () => {
      const isHealthy = await router.checkProviderHealth(AIProvider.CLAUDE);
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});
