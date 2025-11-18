/**
 * Supabase CMS Settings Repository
 * Sprint 23: CMS
 */

import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import { ICMSSettingsRepository } from '@/3-domain/interfaces/repositories/ICMSSettingsRepository';
import {
  CMSSettings,
  CreateCMSSettingsDto,
  UpdateCMSSettingsDto,
  CMSSettingsCategory,
} from '@/3-domain/entities/CMSSettings';

export class SupabaseCMSSettingsRepository implements ICMSSettingsRepository {
  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  async create(dto: CreateCMSSettingsDto, updatedBy: string): Promise<Result<CMSSettings>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Check if setting exists
      const existsResult = await this.exists(dto.key);
      if (existsResult.isFailure) {
        return Result.fail(existsResult.error || 'Ayar kontrolü başarısız');
      }
      if (existsResult.value) {
        return Result.fail(`Ayar "${dto.key}" zaten mevcut`);
      }

      const { data, error } = await supabase
        .from('cms_settings')
        .insert({
          key: dto.key,
          value: dto.value,
          category: dto.category,
          description: dto.description,
          updated_by: updatedBy,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Ayar oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Ayar oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async update(
    key: string,
    dto: UpdateCMSSettingsDto,
    updatedBy: string
  ): Promise<Result<CMSSettings>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: Record<string, any> = {
        updated_by: updatedBy,
      };
      if (dto.value !== undefined) updateData.value = dto.value;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.description !== undefined) updateData.description = dto.description;

      const { data, error } = await supabase
        .from('cms_settings')
        .update(updateData)
        .eq('key', key)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.fail(`Ayar "${key}" bulunamadı`);
        }
        return Result.fail(`Ayar güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Ayar güncellenemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async updateMany(
    settings: Record<string, any>,
    updatedBy: string
  ): Promise<Result<CMSSettings[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const results: CMSSettings[] = [];
      const errors: string[] = [];

      for (const [key, value] of Object.entries(settings)) {
        const updateResult = await this.update(key, { value }, updatedBy);
        if (updateResult.isFailure) {
          errors.push(`${key}: ${updateResult.error}`);
        } else if (updateResult.value) {
          results.push(updateResult.value);
        }
      }

      if (errors.length > 0) {
        return Result.fail(`Bazı ayarlar güncellenemedi: ${errors.join(', ')}`);
      }

      return Result.ok(results);
    } catch (error) {
      return Result.fail(
        `Ayarlar güncellenemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async get(key: string): Promise<Result<CMSSettings | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('cms_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Ayar bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Ayar bulunamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getAll(): Promise<Result<CMSSettings[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('cms_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        return Result.fail(`Ayarlar alınamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(
        `Ayarlar alınamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getByCategory(category: CMSSettingsCategory): Promise<Result<CMSSettings[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('cms_settings')
        .select('*')
        .eq('category', category)
        .order('key', { ascending: true });

      if (error) {
        return Result.fail(`Ayarlar alınamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(
        `Ayarlar alınamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async delete(key: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('cms_settings').delete().eq('key', key);

      if (error) {
        return Result.fail(`Ayar silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        `Ayar silinemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async exists(key: string): Promise<Result<boolean>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { count, error } = await supabase
        .from('cms_settings')
        .select('*', { count: 'exact', head: true })
        .eq('key', key);

      if (error) {
        return Result.fail(`Ayar kontrolü yapılamadı: ${error.message}`);
      }

      return Result.ok((count || 0) > 0);
    } catch (error) {
      return Result.fail(
        `Ayar kontrolü yapılamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Map database row to entity
   */
  private mapToEntity(row: any): CMSSettings {
    return {
      id: row.id,
      key: row.key,
      value: row.value,
      category: row.category,
      description: row.description,
      updatedBy: row.updated_by,
      updatedAt: new Date(row.updated_at),
    };
  }
}
