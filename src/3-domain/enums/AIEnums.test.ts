import { describe, it, expect } from 'vitest';
import {
  AIProvider,
  AIUseCase,
  AIModel,
  AIRequestStatus,
  AIUseCaseLabels,
  AIProviderLabels,
  AIModelLabels,
  AI_PROVIDER_MAP,
} from './AIEnums';

describe('AIEnums', () => {
  describe('AIProvider', () => {
    it('should have all required provider types', () => {
      expect(AIProvider.OPENAI).toBe('openai');
      expect(AIProvider.CLAUDE).toBe('claude');
    });

    it('should have labels for all providers', () => {
      expect(AIProviderLabels[AIProvider.OPENAI]).toBe('OpenAI');
      expect(AIProviderLabels[AIProvider.CLAUDE]).toBe('Claude (Anthropic)');
    });
  });

  describe('AIUseCase', () => {
    it('should have all required use case types', () => {
      expect(AIUseCase.TASK_DESCRIPTION).toBe('task_description');
      expect(AIUseCase.REPORT_GENERATION).toBe('report_generation');
      expect(AIUseCase.NEWS_REWRITE).toBe('news_rewrite');
      expect(AIUseCase.FORUM_MODERATION).toBe('forum_moderation');
      expect(AIUseCase.CV_ANALYSIS).toBe('cv_analysis');
      expect(AIUseCase.DOCUMENT_SUMMARY).toBe('document_summary');
      expect(AIUseCase.CHATBOT).toBe('chatbot');
      expect(AIUseCase.RISK_ANALYSIS).toBe('risk_analysis');
      expect(AIUseCase.SUCCESS_PREDICTION).toBe('success_prediction');
      expect(AIUseCase.TREND_ANALYSIS).toBe('trend_analysis');
      expect(AIUseCase.CONTENT_GENERATION).toBe('content_generation');
      expect(AIUseCase.OTHER).toBe('other');
    });

    it('should have labels for all use cases', () => {
      Object.values(AIUseCase).forEach((useCase) => {
        expect(AIUseCaseLabels[useCase]).toBeDefined();
        expect(typeof AIUseCaseLabels[useCase]).toBe('string');
        expect(AIUseCaseLabels[useCase].length).toBeGreaterThan(0);
      });
    });
  });

  describe('AIModel', () => {
    it('should have all required model types', () => {
      expect(AIModel.GPT_4).toBe('gpt-4');
      expect(AIModel.GPT_4_TURBO).toBe('gpt-4-turbo');
      expect(AIModel.GPT_3_5_TURBO).toBe('gpt-3.5-turbo');
      expect(AIModel.CLAUDE_OPUS).toBe('claude-opus');
      expect(AIModel.CLAUDE_SONNET).toBe('claude-sonnet');
      expect(AIModel.CLAUDE_HAIKU).toBe('claude-haiku');
    });

    it('should have labels for all models', () => {
      Object.values(AIModel).forEach((model) => {
        expect(AIModelLabels[model]).toBeDefined();
        expect(typeof AIModelLabels[model]).toBe('string');
        expect(AIModelLabels[model].length).toBeGreaterThan(0);
      });
    });
  });

  describe('AIRequestStatus', () => {
    it('should have all required status types', () => {
      expect(AIRequestStatus.SUCCESS).toBe('success');
      expect(AIRequestStatus.ERROR).toBe('error');
      expect(AIRequestStatus.TIMEOUT).toBe('timeout');
      expect(AIRequestStatus.RATE_LIMITED).toBe('rate_limited');
    });
  });

  describe('AI_PROVIDER_MAP', () => {
    it('should have mapping for all use cases', () => {
      Object.values(AIUseCase).forEach((useCase) => {
        expect(AI_PROVIDER_MAP[useCase]).toBeDefined();
        expect(AI_PROVIDER_MAP[useCase].provider).toBeDefined();
        expect(AI_PROVIDER_MAP[useCase].model).toBeDefined();
      });
    });

    it('should map task_description to OpenAI GPT-4', () => {
      expect(AI_PROVIDER_MAP[AIUseCase.TASK_DESCRIPTION].provider).toBe(AIProvider.OPENAI);
      expect(AI_PROVIDER_MAP[AIUseCase.TASK_DESCRIPTION].model).toBe(AIModel.GPT_4);
    });

    it('should map report_generation to Claude Opus', () => {
      expect(AI_PROVIDER_MAP[AIUseCase.REPORT_GENERATION].provider).toBe(AIProvider.CLAUDE);
      expect(AI_PROVIDER_MAP[AIUseCase.REPORT_GENERATION].model).toBe(AIModel.CLAUDE_OPUS);
    });
  });
});
