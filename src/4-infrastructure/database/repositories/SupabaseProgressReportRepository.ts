/**
 * SupabaseProgressReportRepository
 * Progress report repository implementation using Supabase
 */

import { createClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import {
  ProgressReport,
  CreateProgressReportDto,
  UpdateProgressReportDto,
  ReportType,
  ReportStatus,
  AIAnalysis,
} from '@/3-domain/entities/ProgressReport';

export class SupabaseProgressReportRepository implements IProgressReportRepository {
  private readonly tableName = 'progress_reports';

  async create(dto: CreateProgressReportDto): Promise<Result<ProgressReport>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          company_id: dto.companyId || null,
          program_id: dto.programId || null,
          project_id: dto.projectId || null,
          sub_project_id: dto.subProjectId || null,
          consultant_id: dto.consultantId || null,
          report_type: dto.reportType,
          title: dto.title,
          period_year: dto.periodYear || null,
          period_month: dto.periodMonth || null,
          template_id: dto.templateId || null,
          content: dto.content || {},
          metadata: dto.metadata || {},
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Rapor oluşturulamadı');
    }
  }

  async update(id: string, dto: UpdateProgressReportDto): Promise<Result<ProgressReport>> {
    try {
      const supabase = await createClient();
      const updateData: Record<string, any> = {};

      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.aiAnalysis !== undefined) updateData.ai_analysis = dto.aiAnalysis;
      if (dto.pdfUrl !== undefined) updateData.pdf_url = dto.pdfUrl;
      if (dto.pdfGeneratedAt !== undefined) updateData.pdf_generated_at = dto.pdfGeneratedAt;
      if (dto.emailSent !== undefined) updateData.email_sent = dto.emailSent;
      if (dto.emailSentAt !== undefined) updateData.email_sent_at = dto.emailSentAt;
      if (dto.emailRecipients !== undefined) updateData.email_recipients = dto.emailRecipients;
      if (dto.errorMessage !== undefined) updateData.error_message = dto.errorMessage;
      if (dto.errorDetails !== undefined) updateData.error_details = dto.errorDetails;
      if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

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
      return Result.fail(error instanceof Error ? error.message : 'Rapor güncellenemedi');
    }
  }

  async findById(id: string): Promise<Result<ProgressReport | null>> {
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
      return Result.fail(error instanceof Error ? error.message : 'Rapor bulunamadı');
    }
  }

  async findMany(filters?: {
    companyId?: string;
    programId?: string;
    projectId?: string;
    subProjectId?: string;
    consultantId?: string;
    reportType?: ReportType;
    status?: ReportStatus;
    periodYear?: number;
    periodMonth?: number;
    limit?: number;
    offset?: number;
  }): Promise<Result<ProgressReport[]>> {
    try {
      const supabase = await createClient();
      let query = supabase.from(this.tableName).select('*');

      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      if (filters?.programId) {
        query = query.eq('program_id', filters.programId);
      }
      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters?.subProjectId) {
        query = query.eq('sub_project_id', filters.subProjectId);
      }
      if (filters?.consultantId) {
        query = query.eq('consultant_id', filters.consultantId);
      }
      if (filters?.reportType) {
        query = query.eq('report_type', filters.reportType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.periodYear) {
        query = query.eq('period_year', filters.periodYear);
      }
      if (filters?.periodMonth) {
        query = query.eq('period_month', filters.periodMonth);
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
      return Result.fail(error instanceof Error ? error.message : 'Raporlar listelenemedi');
    }
  }

  async findByCompany(
    companyId: string,
    filters?: {
      reportType?: ReportType;
      status?: ReportStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ProgressReport[]>> {
    return this.findMany({
      companyId,
      ...filters,
    });
  }

  async findByProgram(
    programId: string,
    filters?: {
      reportType?: ReportType;
      status?: ReportStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ProgressReport[]>> {
    return this.findMany({
      programId,
      ...filters,
    });
  }

  async findByProject(
    projectId: string,
    filters?: {
      reportType?: ReportType;
      status?: ReportStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ProgressReport[]>> {
    return this.findMany({
      projectId,
      ...filters,
    });
  }

  async findBySubProject(
    subProjectId: string,
    filters?: {
      reportType?: ReportType;
      status?: ReportStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ProgressReport[]>> {
    return this.findMany({
      subProjectId,
      ...filters,
    });
  }

  async existsMonthlyReport(
    companyId: string,
    programId: string,
    periodYear: number,
    periodMonth: number
  ): Promise<Result<boolean>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('company_id', companyId)
        .eq('program_id', programId)
        .eq('report_type', 'monthly')
        .eq('period_year', periodYear)
        .eq('period_month', periodMonth)
        .limit(1)
        .maybeSingle();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data !== null);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kontrol yapılamadı');
    }
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
      return Result.fail(error instanceof Error ? error.message : 'Rapor silinemedi');
    }
  }

  async count(filters?: {
    companyId?: string;
    programId?: string;
    reportType?: ReportType;
    status?: ReportStatus;
  }): Promise<Result<number>> {
    try {
      const supabase = await createClient();
      let query = supabase.from(this.tableName).select('id', { count: 'exact', head: true });

      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      if (filters?.programId) {
        query = query.eq('program_id', filters.programId);
      }
      if (filters?.reportType) {
        query = query.eq('report_type', filters.reportType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
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

  private mapToEntity(data: any): ProgressReport {
    return {
      id: data.id,
      companyId: data.company_id,
      programId: data.program_id,
      projectId: data.project_id,
      subProjectId: data.sub_project_id,
      consultantId: data.consultant_id,
      reportType: data.report_type as ReportType,
      status: data.status as ReportStatus,
      title: data.title,
      periodYear: data.period_year,
      periodMonth: data.period_month,
      templateId: data.template_id,
      content: data.content || {},
      aiAnalysis: data.ai_analysis ? this.mapToAIAnalysis(data.ai_analysis) : null,
      pdfUrl: data.pdf_url,
      pdfGeneratedAt: data.pdf_generated_at ? new Date(data.pdf_generated_at) : null,
      emailSent: data.email_sent || false,
      emailSentAt: data.email_sent_at ? new Date(data.email_sent_at) : null,
      emailRecipients: data.email_recipients || [],
      errorMessage: data.error_message,
      errorDetails: data.error_details,
      metadata: data.metadata || {},
      generatedBy: data.generated_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToAIAnalysis(data: any): AIAnalysis {
    return {
      summary: data.summary || '',
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      recommendations: data.recommendations || [],
      riskScore: data.riskScore || 0,
      successProbability: data.successProbability || 0,
    };
  }
}
