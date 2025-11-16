/**
 * AI Enums
 *
 * AI altyapısı için enum tanımlamaları
 */

/**
 * AI Provider Types
 */
export enum AIProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
}

/**
 * AI Use Case Types
 */
export enum AIUseCase {
  TASK_DESCRIPTION = 'task_description',
  REPORT_GENERATION = 'report_generation',
  NEWS_REWRITE = 'news_rewrite',
  FORUM_MODERATION = 'forum_moderation',
  CV_ANALYSIS = 'cv_analysis',
  DOCUMENT_SUMMARY = 'document_summary',
  CHATBOT = 'chatbot',
  RISK_ANALYSIS = 'risk_analysis',
  SUCCESS_PREDICTION = 'success_prediction',
  TREND_ANALYSIS = 'trend_analysis',
  CONTENT_GENERATION = 'content_generation',
  OTHER = 'other',
}

/**
 * AI Model Types
 */
export enum AIModel {
  // OpenAI Models
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  // Claude Models
  CLAUDE_OPUS = 'claude-opus',
  CLAUDE_SONNET = 'claude-sonnet',
  CLAUDE_HAIKU = 'claude-haiku',
}

/**
 * AI Request Status
 */
export enum AIRequestStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  RATE_LIMITED = 'rate_limited',
}

/**
 * AI Use Case Labels (Türkçe)
 */
export const AIUseCaseLabels: Record<AIUseCase, string> = {
  [AIUseCase.TASK_DESCRIPTION]: 'Görev Açıklaması',
  [AIUseCase.REPORT_GENERATION]: 'Rapor Üretimi',
  [AIUseCase.NEWS_REWRITE]: 'Haber Yeniden Yazma',
  [AIUseCase.FORUM_MODERATION]: 'Forum Moderasyonu',
  [AIUseCase.CV_ANALYSIS]: 'CV Analizi',
  [AIUseCase.DOCUMENT_SUMMARY]: 'Döküman Özeti',
  [AIUseCase.CHATBOT]: 'Chatbot',
  [AIUseCase.RISK_ANALYSIS]: 'Risk Analizi',
  [AIUseCase.SUCCESS_PREDICTION]: 'Başarı Tahmini',
  [AIUseCase.TREND_ANALYSIS]: 'Trend Analizi',
  [AIUseCase.CONTENT_GENERATION]: 'İçerik Üretimi',
  [AIUseCase.OTHER]: 'Diğer',
};

/**
 * AI Provider Labels (Türkçe)
 */
export const AIProviderLabels: Record<AIProvider, string> = {
  [AIProvider.OPENAI]: 'OpenAI',
  [AIProvider.CLAUDE]: 'Claude (Anthropic)',
};

/**
 * AI Model Labels (Türkçe)
 */
export const AIModelLabels: Record<AIModel, string> = {
  [AIModel.GPT_4]: 'GPT-4',
  [AIModel.GPT_4_TURBO]: 'GPT-4 Turbo',
  [AIModel.GPT_3_5_TURBO]: 'GPT-3.5 Turbo',
  [AIModel.CLAUDE_OPUS]: 'Claude Opus',
  [AIModel.CLAUDE_SONNET]: 'Claude Sonnet',
  [AIModel.CLAUDE_HAIKU]: 'Claude Haiku',
};

/**
 * Use case bazlı provider mapping
 */
export const AI_PROVIDER_MAP: Record<AIUseCase, { provider: AIProvider; model: AIModel }> = {
  [AIUseCase.TASK_DESCRIPTION]: { provider: AIProvider.OPENAI, model: AIModel.GPT_4 },
  [AIUseCase.NEWS_REWRITE]: { provider: AIProvider.OPENAI, model: AIModel.GPT_4 },
  [AIUseCase.FORUM_MODERATION]: { provider: AIProvider.OPENAI, model: AIModel.GPT_3_5_TURBO },
  [AIUseCase.CHATBOT]: { provider: AIProvider.OPENAI, model: AIModel.GPT_4 },
  [AIUseCase.REPORT_GENERATION]: { provider: AIProvider.CLAUDE, model: AIModel.CLAUDE_OPUS },
  [AIUseCase.CV_ANALYSIS]: { provider: AIProvider.CLAUDE, model: AIModel.CLAUDE_SONNET },
  [AIUseCase.DOCUMENT_SUMMARY]: { provider: AIProvider.CLAUDE, model: AIModel.CLAUDE_HAIKU },
  [AIUseCase.RISK_ANALYSIS]: { provider: AIProvider.CLAUDE, model: AIModel.CLAUDE_OPUS },
  [AIUseCase.SUCCESS_PREDICTION]: { provider: AIProvider.CLAUDE, model: AIModel.CLAUDE_OPUS },
  [AIUseCase.TREND_ANALYSIS]: { provider: AIProvider.CLAUDE, model: AIModel.CLAUDE_SONNET },
  [AIUseCase.CONTENT_GENERATION]: { provider: AIProvider.OPENAI, model: AIModel.GPT_4 },
  [AIUseCase.OTHER]: { provider: AIProvider.OPENAI, model: AIModel.GPT_4 },
};
