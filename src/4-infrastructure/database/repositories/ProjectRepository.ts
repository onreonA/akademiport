import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/domain/entities/Project';
import { createClient } from '@/infrastructure/database/supabase-server';

export class ProjectRepository implements IProjectRepository {
  async create(data: CreateProjectDto): Promise<Project> {
    const supabase = await createClient();

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        company_id: data.companyId || null,
        consultant_id: data.consultantId || null,
        name: data.name,
        description: data.description || null,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        is_template: data.isTemplate || false,
        template_id: data.templateId || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return this.mapToEntity(project);
  }

  async findById(id: string): Promise<Project | null> {
    const supabase = await createClient();

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find project: ${error.message}`);
    }

    return this.mapToEntity(project);
  }

  async findAll(filters?: {
    companyId?: string;
    consultantId?: string;
    status?: string;
    isTemplate?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Project[]; total: number }> {
    const supabase = await createClient();
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase.from('projects').select('*', { count: 'exact' });

    if (filters?.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters?.consultantId) {
      query = query.eq('consultant_id', filters.consultantId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.isTemplate !== undefined) {
      query = query.eq('is_template', filters.isTemplate);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: projects, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find projects: ${error.message}`);
    }

    return {
      data: projects?.map((p) => this.mapToEntity(p)) || [],
      total: count || 0,
    };
  }

  async findByCompanyId(companyId: string): Promise<Project[]> {
    const supabase = await createClient();

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find projects by company: ${error.message}`);
    }

    return projects?.map((p) => this.mapToEntity(p)) || [];
  }

  async findByConsultantId(consultantId: string): Promise<Project[]> {
    const supabase = await createClient();

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find projects by consultant: ${error.message}`);
    }

    return projects?.map((p) => this.mapToEntity(p)) || [];
  }

  async findTemplates(): Promise<Project[]> {
    console.log('📦 [ProjectRepository] findTemplates() called');
    const supabase = await createClient();

    console.log('🔍 [ProjectRepository] Querying projects table...');
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_template', true)
      .order('name', { ascending: true });

    console.log('📊 [ProjectRepository] Query result:', {
      projectCount: projects?.length || 0,
      hasError: !!error,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      errorCode: error?.code,
    });

    if (error) {
      console.error('❌ [ProjectRepository] Supabase error:', error);
      throw new Error(`Failed to find project templates: ${error.message}`);
    }

    console.log('✅ [ProjectRepository] Returning', projects?.length || 0, 'templates');
    return projects?.map((p) => this.mapToEntity(p)) || [];
  }

  async findByTemplateId(templateId: string): Promise<Project[]> {
    const supabase = await createClient();

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find projects by template: ${error.message}`);
    }

    return projects?.map((p) => this.mapToEntity(p)) || [];
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.companyId !== undefined) updateData.company_id = data.companyId;
    if (data.consultantId !== undefined) updateData.consultant_id = data.consultantId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.startDate !== undefined) updateData.start_date = data.startDate;
    if (data.endDate !== undefined) updateData.end_date = data.endDate;
    if (data.progress !== undefined) updateData.progress = data.progress;

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return this.mapToEntity(project);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('projects').select('id').eq('id', id).single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check project existence: ${error.message}`);
    }

    return !!data;
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('projects').update({ progress }).eq('id', id);

    if (error) {
      throw new Error(`Failed to update project progress: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Project {
    return {
      id: data.id,
      companyId: data.company_id,
      consultantId: data.consultant_id,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.start_date ? new Date(data.start_date) : null,
      endDate: data.end_date ? new Date(data.end_date) : null,
      progress: data.progress,
      isTemplate: data.is_template,
      templateId: data.template_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
