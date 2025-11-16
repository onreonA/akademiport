/**
 * Prompt Manager Interface
 *
 * Prompt şablon yönetimi için interface
 */

import { Result } from '@/6-core/result/Result';
import { AIPrompt } from '@/3-domain/entities/AI';
import { AIUseCase } from '@/3-domain/enums/AIEnums';

export interface IPromptManager {
  /**
   * Use case için aktif prompt'u getir
   */
  getActivePrompt(useCase: AIUseCase): Promise<Result<AIPrompt | null>>;

  /**
   * Prompt'u değişkenlerle doldur
   */
  renderPrompt(prompt: AIPrompt, variables: Record<string, any>): string;

  /**
   * Prompt oluştur
   */
  createPrompt(prompt: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<AIPrompt>>;

  /**
   * Prompt güncelle
   */
  updatePrompt(id: string, updates: Partial<AIPrompt>): Promise<Result<AIPrompt>>;

  /**
   * Prompt versiyonlarını listele
   */
  listPromptVersions(useCase: AIUseCase): Promise<Result<AIPrompt[]>>;
}
