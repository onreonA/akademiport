import { ICompanyProjectAssignmentRepository } from '@/domain/interfaces/repositories/ICompanyProjectAssignmentRepository';
import {
  CompanyProjectAssignment,
  CompanyProjectAssignmentEntity,
  CreateCompanyProjectAssignmentDto,
  UpdateCompanyProjectAssignmentDto,
} from '@/domain/entities/CompanyProjectAssignment';
import { createClient } from '@/infrastructure/database/supabase-server';

type CompanyProjectAssignmentRow = {
  id: string;
  company_id: string;
  project_id: string;
  sub_project_id: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export class CompanyProjectAssignmentRepository implements ICompanyProjectAssignmentRepository {
  async create(data: CreateCompanyProjectAssignmentDto): Promise<CompanyProjectAssignment> {
    const supabase = await createClient();

    const payload = this.mapToRowInput(data);

    const { data: rows, error } = await supabase
      .from('company_project_assignments')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create company project assignment: ${error.message}`);
    }

    if (!rows) {
      throw new Error('Failed to create company project assignment: empty response');
    }

    return this.mapToEntity(rows);
  }

  async createMany(data: CreateCompanyProjectAssignmentDto[]): Promise<CompanyProjectAssignment[]> {
    if (data.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const payload = data.map((item) => this.mapToRowInput(item));

    const { data: rows, error } = await supabase
      .from('company_project_assignments')
      .insert(payload)
      .select();

    if (error) {
      throw new Error(`Failed to create company project assignments: ${error.message}`);
    }

    return (rows || []).map((row) => this.mapToEntity(row));
  }

  async findById(id: string): Promise<CompanyProjectAssignment | null> {
    const supabase = await createClient();

    const {
      data: row,
      error,
      status,
    } = await supabase.from('company_project_assignments').select('*').eq('id', id).maybeSingle();

    if (error) {
      if (status === 406) {
        return null;
      }
      throw new Error(`Failed to fetch company project assignment: ${error.message}`);
    }

    if (!row) {
      return null;
    }

    return this.mapToEntity(row);
  }

  async findByCompanyAndProject(
    companyId: string,
    projectId: string
  ): Promise<CompanyProjectAssignment[]> {
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from('company_project_assignments')
      .select('*')
      .eq('company_id', companyId)
      .eq('project_id', projectId)
      .order('sub_project_id', { ascending: true, nullsFirst: true });

    if (error) {
      throw new Error(
        `Failed to fetch company project assignments for company ${companyId} and project ${projectId}: ${error.message}`
      );
    }

    return (rows || []).map((row) => this.mapToEntity(row));
  }

  async findByProject(projectId: string): Promise<CompanyProjectAssignment[]> {
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from('company_project_assignments')
      .select('*')
      .eq('project_id', projectId)
      .order('company_id', { ascending: true })
      .order('sub_project_id', { ascending: true, nullsFirst: true });

    if (error) {
      throw new Error(
        `Failed to fetch company project assignments for project ${projectId}: ${error.message}`
      );
    }

    return (rows || []).map((row) => this.mapToEntity(row));
  }

  async findBySubProject(subProjectId: string): Promise<CompanyProjectAssignment[]> {
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from('company_project_assignments')
      .select('*')
      .eq('sub_project_id', subProjectId)
      .order('company_id', { ascending: true });

    if (error) {
      throw new Error(
        `Failed to fetch company project assignments for sub-project ${subProjectId}: ${error.message}`
      );
    }

    return (rows || []).map((row) => this.mapToEntity(row));
  }

  async update(
    id: string,
    data: UpdateCompanyProjectAssignmentDto
  ): Promise<CompanyProjectAssignment> {
    const supabase = await createClient();

    const payload = this.mapToUpdateRowInput(data);

    const { data: row, error } = await supabase
      .from('company_project_assignments')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update company project assignment: ${error.message}`);
    }

    if (!row) {
      throw new Error('Failed to update company project assignment: empty response');
    }

    return this.mapToEntity(row);
  }

  async updateMany(
    updates: Array<{ id: string; data: UpdateCompanyProjectAssignmentDto }>
  ): Promise<CompanyProjectAssignment[]> {
    if (updates.length === 0) {
      return [];
    }

    const results: CompanyProjectAssignment[] = [];

    for (const updateItem of updates) {
      const updated = await this.update(updateItem.id, updateItem.data);
      results.push(updated);
    }

    return results;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('company_project_assignments').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete company project assignment: ${error.message}`);
    }
  }

  async deleteByCompanyAndSubProject(companyId: string, subProjectId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('company_project_assignments')
      .delete()
      .eq('company_id', companyId)
      .eq('sub_project_id', subProjectId);

    if (error) {
      throw new Error(
        `Failed to delete company project assignment for company ${companyId} and sub-project ${subProjectId}: ${error.message}`
      );
    }
  }

  async exists(options: {
    companyId: string;
    projectId: string;
    subProjectId?: string | null;
  }): Promise<boolean> {
    const supabase = await createClient();

    let query = supabase
      .from('company_project_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', options.companyId)
      .eq('project_id', options.projectId);

    if (options.subProjectId !== undefined) {
      query = query.eq('sub_project_id', options.subProjectId);
    }

    const { error, count } = await query;

    if (error) {
      throw new Error(`Failed to check company project assignment existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  private mapToEntity(row: CompanyProjectAssignmentRow): CompanyProjectAssignment {
    return new CompanyProjectAssignmentEntity({
      id: row.id,
      companyId: row.company_id,
      projectId: row.project_id,
      subProjectId: row.sub_project_id,
      startDate: row.start_date ? new Date(row.start_date) : null,
      endDate: row.end_date ? new Date(row.end_date) : null,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private mapToRowInput(data: CreateCompanyProjectAssignmentDto) {
    return {
      company_id: data.companyId,
      project_id: data.projectId,
      sub_project_id: data.subProjectId ?? null,
      start_date: data.startDate ?? null,
      end_date: data.endDate ?? null,
      is_active: data.isActive ?? true,
    };
  }

  private mapToUpdateRowInput(data: UpdateCompanyProjectAssignmentDto) {
    const payload: Record<string, unknown> = {};

    if (data.startDate !== undefined) {
      payload.start_date = data.startDate ?? null;
    }

    if (data.endDate !== undefined) {
      payload.end_date = data.endDate ?? null;
    }

    if (data.isActive !== undefined) {
      payload.is_active = data.isActive;
    }

    return payload;
  }
}

