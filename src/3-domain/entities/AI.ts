/**
 * AI Domain Entities
 *
 * AI altyapısı için domain entity'leri
 */

import { AIProvider, AIUseCase, AIModel, AIRequestStatus } from '../enums/AIEnums';

/**
 * AI Prompt Entity
 */
export interface AIPrompt {
  id: string;
  name: string;
  description?: string | null;
  useCase: AIUseCase;
  template: string;
  variables: Record<string, any>;
  version: number;
  isActive: boolean;
  provider: AIProvider;
  model: AIModel;
  temperature: number;
  maxTokens: number;
  topP: number;
  metadata?: Record<string, any> | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI Usage Log Entity
 */
export interface AIUsageLog {
  id: string;
  userId?: string | null;
  companyId?: string | null;
  programId?: string | null;
  provider: AIProvider;
  model: AIModel;
  useCase: AIUseCase;
  promptId?: string | null;
  promptVersion?: number | null;
  requestText?: string | null;
  responseText?: string | null;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  costUsd: number;
  status: AIRequestStatus;
  errorMessage?: string | null;
  errorCode?: string | null;
  durationMs?: number | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

/**
 * AI Provider Config Entity
 */
export interface AIProviderConfig {
  id: string;
  provider: AIProvider;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  timeoutMs: number;
  maxRetries: number;
  defaultModel: AIModel;
  isActive: boolean;
  isEnabled: boolean;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI Request Options
 */
export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  userId?: string;
  companyId?: string;
  programId?: string;
  metadata?: Record<string, any>;
}

/**
 * AI Response
 */
export interface AIResponse {
  text: string;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
  model: AIModel;
  provider: AIProvider;
}

/**
 * AI Error
 */
export interface AIError {
  message: string;
  code?: string;
  status?: number;
  retryable: boolean;
}
