/**
 * SupabaseCustomReportRepository
 * Custom report repository implementation using Supabase
 */

import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import {
  CustomReport,
  CreateCustomReportDto,
  UpdateCustomReportDto,
  CustomReportFilterDto,
  CustomReportEntity,
} from '@/3-domain/entities/CustomReport';

export class SupabaseCustomReportRepository implements ICustomReportRepository {
  private readonly tableName = 'custom_reports';

  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  async create(dto: CreateCustomReportDto, userId: string): Promise<Result<CustomReport>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          name: dto.name,
          description: dto.description || null,
          user_id: userId,
          program_id: dto.programId || null,
          company_id: dto.companyId || null,
          report_type: dto.reportType,
          template_id: dto.templateId || null,
          selected_metrics: dto.selectedMetrics || [],
          date_range_start: dto.dateRangeStart || null,
          date_range_end: dto.dateRangeEnd || null,
          date_range_type: dto.dateRangeType,
          filters: dto.filters || {},
          is_scheduled: dto.isScheduled || false,
          schedule_cron: dto.scheduleCron || null,
          schedule_timezone: dto.scheduleTimezone || 'Europe/Istanbul',
          status: 'draft',
          metadata: dto.metadata || {},
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Custom report oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Custom report oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  async update(id: string, dto: UpdateCustomReportDto): Promise<Result<CustomReport>> {
    try {
      const supabase = await this.getSupabaseClient();
      const updateData: Record<string, any> = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.programId !== undefined) updateData.program_id = dto.programId;
      if (dto.companyId !== undefined) updateData.company_id = dto.companyId;
      if (dto.reportType !== undefined) updateData.report_type = dto.reportType;
      if (dto.templateId !== undefined) updateData.template_id = dto.templateId;
      if (dto.selectedMetrics !== undefined) updateData.selected_metrics = dto.selectedMetrics;
      if (dto.dateRangeStart !== undefined) updateData.date_range_start = dto.dateRangeStart;
      if (dto.dateRangeEnd !== undefined) updateData.date_range_end = dto.dateRangeEnd;
      if (dto.dateRangeType !== undefined) updateData.date_range_type = dto.dateRangeType;
      if (dto.filters !== undefined) updateData.filters = dto.filters;
      if (dto.isScheduled !== undefined) updateData.is_scheduled = dto.isScheduled;
      if (dto.scheduleCron !== undefined) updateData.schedule_cron = dto.scheduleCron;
      if (dto.scheduleTimezone !== undefined) updateData.schedule_timezone = dto.scheduleTimezone;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Custom report güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Custom report güncellenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from(this.tableName).delete().eq('id', id);

      if (error) {
        return Result.fail(`Custom report silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        `Custom report silinemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  async findById(id: string): Promise<Result<CustomReport | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Custom report bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Custom report bulunamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  async findWithFilters(
    filter: CustomReportFilterDto
  ): Promise<Result<{ reports: CustomReport[]; total: number }>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from(this.tableName).select('*', { count: 'exact' });

      if (filter.userId) {
        query = query.eq('user_id', filter.userId);
      }
      if (filter.programId) {
        query = query.eq('program_id', filter.programId);
      }
      if (filter.companyId) {
        query = query.eq('company_id', filter.companyId);
      }
      if (filter.reportType) {
        query = query.eq('report_type', filter.reportType);
      }
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      if (filter.isScheduled !== undefined) {
        query = query.eq('is_scheduled', filter.isScheduled);
      }

      // Sorting
      const sortBy = filter.sortBy || 'createdAt';
      const sortOrder = filter.sortOrder || 'desc';
      const sortColumn = this.mapSortColumn(sortBy);
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      // Pagination
      const page = filter.page || 1;
      const limit = filter.limit || 10;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return Result.fail(`Custom report'lar alınamadı: ${error.message}`);
      }

      const reports = (data || []).map((item) => this.mapToEntity(item));

      return Result.ok({
        reports,
        total: count || 0,
      });
    } catch (error) {
      return Result.fail(
        `Custom report'lar alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  async findByUserId(userId: string): Promise<Result<CustomReport[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(`Custom report'lar alınamadı: ${error.message}`);
      }

      const reports = (data || []).map((item) => this.mapToEntity(item));

      return Result.ok(reports);
    } catch (error) {
      return Result.fail(
        `Custom report'lar alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  async findScheduledReports(): Promise<Result<CustomReport[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_scheduled', true)
        .eq('status', 'scheduled')
        .order('next_generation_at', { ascending: true });

      if (error) {
        return Result.fail(`Zamanlanmış report'lar alınamadı: ${error.message}`);
      }

      const reports = (data || []).map((item) => this.mapToEntity(item));

      return Result.ok(reports);
    } catch (error) {
      return Result.fail(
        `Zamanlanmış report'lar alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  async findReportsToGenerate(): Promise<Result<CustomReport[]>> {
    try {
      const supabase = await this.getSupabaseClient();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_scheduled', true)
        .eq('status', 'scheduled')
        .lte('next_generation_at', now)
        .order('next_generation_at', { ascending: true });

      if (error) {
        return Result.fail(`Generation zamanı gelmiş report'lar alınamadı: ${error.message}`);
      }

      const reports = (data || []).map((item) => this.mapToEntity(item));

      return Result.ok(reports);
    } catch (error) {
      return Result.fail(
        `Generation zamanı gelmiş report'lar alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  async updateGenerationTime(
    id: string,
    lastGeneratedAt: Date,
    nextGenerationAt: Date | null
  ): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: Record<string, any> = {
        last_generated_at: lastGeneratedAt.toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (nextGenerationAt) {
        updateData.next_generation_at = nextGenerationAt.toISOString();
      } else {
        updateData.next_generation_at = null;
      }

      const { error } = await supabase.from(this.tableName).update(updateData).eq('id', id);

      if (error) {
        return Result.fail(`Generation zamanı güncellenemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        `Generation zamanı güncellenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  }

  /**
   * Database row'u entity'ye map et
   */
  private mapToEntity(data: any): CustomReport {
    return new CustomReportEntity({
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
      programId: data.program_id,
      companyId: data.company_id,
      reportType: data.report_type,
      templateId: data.template_id,
      selectedMetrics: data.selected_metrics || [],
      dateRangeStart: data.date_range_start ? new Date(data.date_range_start) : null,
      dateRangeEnd: data.date_range_end ? new Date(data.date_range_end) : null,
      dateRangeType: data.date_range_type,
      filters: data.filters || {},
      isScheduled: data.is_scheduled || false,
      scheduleCron: data.schedule_cron,
      scheduleTimezone: data.schedule_timezone || 'Europe/Istanbul',
      lastGeneratedAt: data.last_generated_at ? new Date(data.last_generated_at) : null,
      nextGenerationAt: data.next_generation_at ? new Date(data.next_generation_at) : null,
      status: data.status,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  /**
   * Sort column mapping
   */
  private mapSortColumn(sortBy: string): string {
    const mapping: Record<string, string> = {
      name: 'name',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      lastGeneratedAt: 'last_generated_at',
    };
    return mapping[sortBy] || 'created_at';
  }
}
