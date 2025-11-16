/**
 * Prompt Manager Service
 *
 * Prompt şablon yönetimi ve versiyonlama
 */

import { createClient } from '@/4-infrastructure/database/supabase-server';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { AIPrompt } from '@/3-domain/entities/AI';
import { AIUseCase } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { logger } from '@/5-shared/utils/logger';

export class PromptManagerService implements IPromptManager {
  async getActivePrompt(useCase: AIUseCase): Promise<Result<AIPrompt | null>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .eq('use_case', useCase)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return Result.ok(null);
        }
        logger.error('Failed to get active prompt:', error);
        return Result.fail(new Error(`Failed to get active prompt: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('Error in getActivePrompt:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  renderPrompt(prompt: AIPrompt, variables: Record<string, any>): string {
    let rendered = prompt.template;

    // {{variable}} formatındaki değişkenleri değiştir
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }

    return rendered;
  }

  async createPrompt(
    prompt: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Result<AIPrompt>> {
    try {
      const supabase = await createClient();

      // Eğer yeni prompt aktifse, eski aktif prompt'u pasif yap
      if (prompt.isActive) {
        await supabase
          .from('ai_prompts')
          .update({ is_active: false })
          .eq('use_case', prompt.useCase)
          .eq('is_active', true);
      }

      const { data, error } = await supabase
        .from('ai_prompts')
        .insert({
          name: prompt.name,
          description: prompt.description,
          use_case: prompt.useCase,
          template: prompt.template,
          variables: prompt.variables,
          version: prompt.version,
          is_active: prompt.isActive,
          provider: prompt.provider,
          model: prompt.model,
          temperature: prompt.temperature,
          max_tokens: prompt.maxTokens,
          top_p: prompt.topP,
          metadata: prompt.metadata,
          created_by: prompt.createdBy,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create prompt:', error);
        return Result.fail(new Error(`Failed to create prompt: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('Error in createPrompt:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async updatePrompt(id: string, updates: Partial<AIPrompt>): Promise<Result<AIPrompt>> {
    try {
      const supabase = await createClient();

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.template !== undefined) updateData.template = updates.template;
      if (updates.variables !== undefined) updateData.variables = updates.variables;
      if (updates.version !== undefined) updateData.version = updates.version;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.provider !== undefined) updateData.provider = updates.provider;
      if (updates.model !== undefined) updateData.model = updates.model;
      if (updates.temperature !== undefined) updateData.temperature = updates.temperature;
      if (updates.maxTokens !== undefined) updateData.max_tokens = updates.maxTokens;
      if (updates.topP !== undefined) updateData.top_p = updates.topP;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      // Eğer prompt aktif yapılıyorsa, eski aktif prompt'u pasif yap
      if (updates.isActive === true) {
        const { data: currentPrompt } = await supabase
          .from('ai_prompts')
          .select('use_case')
          .eq('id', id)
          .single();

        if (currentPrompt) {
          await supabase
            .from('ai_prompts')
            .update({ is_active: false })
            .eq('use_case', currentPrompt.use_case)
            .eq('is_active', true)
            .neq('id', id);
        }
      }

      const { data, error } = await supabase
        .from('ai_prompts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update prompt:', error);
        return Result.fail(new Error(`Failed to update prompt: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('Error in updatePrompt:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async listPromptVersions(useCase: AIUseCase): Promise<Result<AIPrompt[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .eq('use_case', useCase)
        .order('version', { ascending: false });

      if (error) {
        logger.error('Failed to list prompt versions:', error);
        return Result.fail(new Error(`Failed to list prompt versions: ${error.message}`));
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      logger.error('Error in listPromptVersions:', error);
      return Result.fail(new Error(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Database row'u entity'ye map et
   */
  private mapToEntity(row: any): AIPrompt {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      useCase: row.use_case,
      template: row.template,
      variables: row.variables || {},
      version: row.version,
      isActive: row.is_active,
      provider: row.provider,
      model: row.model,
      temperature: row.temperature,
      maxTokens: row.max_tokens,
      topP: row.top_p,
      metadata: row.metadata,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
