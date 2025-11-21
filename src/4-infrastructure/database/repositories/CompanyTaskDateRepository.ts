import { ICompanyTaskDateRepository } from '@/domain/interfaces/repositories/ICompanyTaskDateRepository';
import {
  CompanyTaskDate,
  CompanyTaskDateEntity,
  CreateCompanyTaskDateDto,
  UpdateCompanyTaskDateDto,
} from '@/domain/entities/CompanyTaskDate';
import { createClient } from '@/infrastructure/database/supabase-server';

type CompanyTaskDateRow = {
  id: string;
  company_id: string;
  task_id: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export class CompanyTaskDateRepository implements ICompanyTaskDateRepository {
  async create(data: CreateCompanyTaskDateDto): Promise<CompanyTaskDate> {
    const supabase = await createClient();

    const payload = this.mapToRowInput(data);

    const { data: rows, error } = await supabase
      .from('company_task_dates')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create company task date: ${error.message}`);
    }

    if (!rows) {
      throw new Error('Failed to create company task date: empty response');
    }

    return this.mapToEntity(rows);
  }

  async createMany(data: CreateCompanyTaskDateDto[]): Promise<CompanyTaskDate[]> {
    if (data.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const payload = data.map((item) => this.mapToRowInput(item));

    const { data: rows, error } = await supabase
      .from('company_task_dates')
      .insert(payload)
      .select();

    if (error) {
      throw new Error(`Failed to create company task dates: ${error.message}`);
    }

    return (rows || []).map((row) => this.mapToEntity(row));
  }

  async findById(id: string): Promise<CompanyTaskDate | null> {
    const supabase = await createClient();

    const {
      data: row,
      error,
      status,
    } = await supabase.from('company_task_dates').select('*').eq('id', id).maybeSingle();

    if (error) {
      if (status === 406) {
        return null;
      }
      throw new Error(`Failed to fetch company task date: ${error.message}`);
    }

    if (!row) {
      return null;
    }

    return this.mapToEntity(row);
  }

  async findByCompanyAndTask(companyId: string, taskId: string): Promise<CompanyTaskDate | null> {
    const supabase = await createClient();

    const { data: row, error } = await supabase
      .from('company_task_dates')
      .select('*')
      .eq('company_id', companyId)
      .eq('task_id', taskId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to fetch company task date for company ${companyId} and task ${taskId}: ${error.message}`
      );
    }

    if (!row) {
      return null;
    }

    return this.mapToEntity(row);
  }

  async findByTask(taskId: string): Promise<CompanyTaskDate[]> {
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from('company_task_dates')
      .select('*')
      .eq('task_id', taskId)
      .order('company_id', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch company task dates for task ${taskId}: ${error.message}`);
    }

    return (rows || []).map((row) => this.mapToEntity(row));
  }

  async findByCompany(companyId: string): Promise<CompanyTaskDate[]> {
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from('company_task_dates')
      .select('*')
      .eq('company_id', companyId)
      .order('task_id', { ascending: true });

    if (error) {
      throw new Error(
        `Failed to fetch company task dates for company ${companyId}: ${error.message}`
      );
    }

    return (rows || []).map((row) => this.mapToEntity(row));
  }

  async findBySubProject(subProjectId: string): Promise<CompanyTaskDate[]> {
    const supabase = await createClient();

    // Önce alt projeye ait görevleri bul
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .eq('sub_project_id', subProjectId);

    if (tasksError) {
      throw new Error(
        `Failed to fetch tasks for sub-project ${subProjectId}: ${tasksError.message}`
      );
    }

    if (!tasks || tasks.length === 0) {
      return [];
    }

    const taskIds = tasks.map((t) => t.id);

    // Sonra bu görevlere ait tarih atamalarını bul
    const { data: rows, error } = await supabase
      .from('company_task_dates')
      .select('*')
      .in('task_id', taskIds)
      .order('company_id', { ascending: true });

    if (error) {
      throw new Error(
        `Failed to fetch company task dates for sub-project ${subProjectId}: ${error.message}`
      );
    }

    return (rows || []).map((row) => this.mapToEntity(row));
  }

  async update(id: string, data: UpdateCompanyTaskDateDto): Promise<CompanyTaskDate> {
    const supabase = await createClient();

    const payload = this.mapToUpdateRowInput(data);

    const { data: row, error } = await supabase
      .from('company_task_dates')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update company task date: ${error.message}`);
    }

    if (!row) {
      throw new Error('Failed to update company task date: empty response');
    }

    return this.mapToEntity(row);
  }

  async updateMany(
    updates: Array<{ id: string; data: UpdateCompanyTaskDateDto }>
  ): Promise<CompanyTaskDate[]> {
    if (updates.length === 0) {
      return [];
    }

    const results: CompanyTaskDate[] = [];

    for (const updateItem of updates) {
      const updated = await this.update(updateItem.id, updateItem.data);
      results.push(updated);
    }

    return results;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('company_task_dates').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete company task date: ${error.message}`);
    }
  }

  async deleteByCompanyAndTask(companyId: string, taskId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('company_task_dates')
      .delete()
      .eq('company_id', companyId)
      .eq('task_id', taskId);

    if (error) {
      throw new Error(
        `Failed to delete company task date for company ${companyId} and task ${taskId}: ${error.message}`
      );
    }
  }

  async exists(options: { companyId: string; taskId: string }): Promise<boolean> {
    const supabase = await createClient();

    const { error, count } = await supabase
      .from('company_task_dates')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', options.companyId)
      .eq('task_id', options.taskId);

    if (error) {
      throw new Error(`Failed to check company task date existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  private mapToEntity(row: CompanyTaskDateRow): CompanyTaskDate {
    return new CompanyTaskDateEntity({
      id: row.id,
      companyId: row.company_id,
      taskId: row.task_id,
      startDate: row.start_date ? new Date(row.start_date) : null,
      endDate: row.end_date ? new Date(row.end_date) : null,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private mapToRowInput(data: CreateCompanyTaskDateDto) {
    return {
      company_id: data.companyId,
      task_id: data.taskId,
      start_date: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : null,
      end_date: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : null,
      is_active: data.isActive ?? true,
    };
  }

  private mapToUpdateRowInput(data: UpdateCompanyTaskDateDto) {
    const payload: Record<string, unknown> = {};

    if (data.startDate !== undefined) {
      payload.start_date = data.startDate
        ? new Date(data.startDate).toISOString().split('T')[0]
        : null;
    }

    if (data.endDate !== undefined) {
      payload.end_date = data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : null;
    }

    if (data.isActive !== undefined) {
      payload.is_active = data.isActive;
    }

    return payload;
  }
}
