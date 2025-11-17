/**
 * SupabaseReportTemplateRepository
 * Report template repository implementation using Supabase
 */

import { createClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import { IReportTemplateRepository } from '@/3-domain/interfaces/repositories/IReportTemplateRepository';
import {
  ReportTemplate,
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  ReportType,
} from '@/3-domain/entities/ReportTemplate';

export class SupabaseReportTemplateRepository implements IReportTemplateRepository {
  private readonly tableName = 'report_templates';

  async create(dto: CreateReportTemplateDto): Promise<Result<ReportTemplate>> {
    try {
      const supabase = await createClient();

      // Eğer aktif template varsa, onu pasif et
      if (dto.reportType) {
        const existingActive = await this.findActiveByType(dto.reportType);
        if (existingActive.isSuccess && existingActive.value) {
          await supabase
            .from(this.tableName)
            .update({ is_active: false })
            .eq('id', existingActive.value.id);
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          name: dto.name,
          description: dto.description || null,
          report_type: dto.reportType,
          template_content: dto.templateContent || {},
          sections: dto.sections || [],
          ai_enabled: dto.aiEnabled !== undefined ? dto.aiEnabled : true,
          ai_use_case: dto.aiUseCase || 'report_generation',
          version: 1,
          is_active: true,
          metadata: dto.metadata || {},
        })
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Template oluşturulamadı');
    }
  }

  async update(id: string, dto: UpdateReportTemplateDto): Promise<Result<ReportTemplate>> {
    try {
      const supabase = await createClient();
      const updateData: Record<string, any> = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.templateContent !== undefined) updateData.template_content = dto.templateContent;
      if (dto.sections !== undefined) updateData.sections = dto.sections;
      if (dto.aiEnabled !== undefined) updateData.ai_enabled = dto.aiEnabled;
      if (dto.aiUseCase !== undefined) updateData.ai_use_case = dto.aiUseCase;
      if (dto.isActive !== undefined) {
        updateData.is_active = dto.isActive;
        // Eğer aktif ediliyorsa, aynı tip için diğer aktif template'leri pasif et
        if (dto.isActive) {
          const template = await this.findById(id);
          if (template.isSuccess && template.value) {
            await supabase
              .from(this.tableName)
              .update({ is_active: false })
              .eq('report_type', template.value.reportType)
              .neq('id', id);
          }
        }
      }
      if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

      // Versiyonu artır
      const { data: currentData } = await supabase
        .from(this.tableName)
        .select('version')
        .eq('id', id)
        .single();

      if (currentData) {
        updateData.version = (currentData.version || 1) + 1;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Template güncellenemedi');
    }
  }

  async findById(id: string): Promise<Result<ReportTemplate | null>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Template bulunamadı');
    }
  }

  async findActiveByType(reportType: ReportType): Promise<Result<ReportTemplate | null>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('report_type', reportType)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data ? this.mapToEntity(data) : null);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Template bulunamadı');
    }
  }

  async findMany(filters?: {
    reportType?: ReportType;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Result<ReportTemplate[]>> {
    try {
      const supabase = await createClient();
      let query = supabase.from(this.tableName).select('*');

      if (filters?.reportType) {
        query = query.eq('report_type', filters.reportType);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : "Template'ler listelenemedi");
    }
  }

  async findByType(
    reportType: ReportType,
    filters?: {
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ReportTemplate[]>> {
    return this.findMany({
      reportType,
      ...filters,
    });
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from(this.tableName).delete().eq('id', id);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Template silinemedi');
    }
  }

  async count(filters?: { reportType?: ReportType; isActive?: boolean }): Promise<Result<number>> {
    try {
      const supabase = await createClient();
      let query = supabase.from(this.tableName).select('id', { count: 'exact', head: true });

      if (filters?.reportType) {
        query = query.eq('report_type', filters.reportType);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { count, error } = await query;

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(count || 0);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Sayım yapılamadı');
    }
  }

  // =====================================================
  // MAPPERS
  // =====================================================

  private mapToEntity(data: any): ReportTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      reportType: data.report_type as ReportType,
      templateContent: data.template_content || {},
      sections: data.sections || [],
      aiEnabled: data.ai_enabled !== undefined ? data.ai_enabled : true,
      aiUseCase: data.ai_use_case || 'report_generation',
      version: data.version || 1,
      isActive: data.is_active !== undefined ? data.is_active : true,
      metadata: data.metadata || {},
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
