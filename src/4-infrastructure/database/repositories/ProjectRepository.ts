import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/domain/entities/Project';
import { createClient } from '@/infrastructure/database/supabase-server';

const PROJECT_SELECT_FIELDS = `
  *,
  company:companies!projects_company_id_fkey ( id, name ),
  consultant:users!projects_consultant_id_fkey ( id, full_name, email ),
  program:programs!projects_program_id_fkey ( id, name )
`;

export class ProjectRepository implements IProjectRepository {
  async create(data: CreateProjectDto): Promise<Project> {
    const supabase = await createClient();

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        company_id: data.companyId || null,
        consultant_id: data.consultantId || null,
        program_id: data.programId || null,
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

  async findById(id: string, includeDeleted: boolean = false): Promise<Project | null> {
    const supabase = await createClient();

    let query = supabase.from('projects').select(PROJECT_SELECT_FIELDS).eq('id', id);

    // Soft delete kontrolü: includeDeleted true değilse sadece silinmemişleri getir
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: project, error } = await query.single();

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
    includeDeleted?: boolean;
  }): Promise<{ data: Project[]; total: number }> {
    const supabase = await createClient();
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase.from('projects').select(PROJECT_SELECT_FIELDS, { count: 'exact' });

    // Soft delete kontrolü: includeDeleted true değilse sadece silinmemişleri getir
    if (!filters?.includeDeleted) {
      query = query.is('deleted_at', null);
    }

    if (filters?.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters?.consultantId) {
      query = query.eq('consultant_id', filters.consultantId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Şablonları varsayılan olarak hariç tut (sadece normal projeleri göster)
    // Eğer isTemplate açıkça belirtilmişse, o değeri kullan
    if (filters?.isTemplate !== undefined) {
      query = query.eq('is_template', filters.isTemplate);
    } else {
      // Varsayılan olarak şablonları hariç tut
      query = query.eq('is_template', false);
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

  async findByCompanyId(companyId: string, includeDeleted: boolean = false): Promise<Project[]> {
    const supabase = await createClient();

    let query = supabase.from('projects').select(PROJECT_SELECT_FIELDS).eq('company_id', companyId);

    // Şablonları hariç tut
    query = query.eq('is_template', false);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: projects, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find projects by company: ${error.message}`);
    }

    return projects?.map((p) => this.mapToEntity(p)) || [];
  }

  async findByConsultantId(
    consultantId: string,
    includeDeleted: boolean = false
  ): Promise<Project[]> {
    const supabase = await createClient();

    let query = supabase
      .from('projects')
      .select(PROJECT_SELECT_FIELDS)
      .eq('consultant_id', consultantId);

    // Şablonları hariç tut
    query = query.eq('is_template', false);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: projects, error } = await query.order('created_at', { ascending: false });

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
      .select(PROJECT_SELECT_FIELDS)
      .eq('is_template', true)
      .is('deleted_at', null) // Şablonlar silinemez ama yine de kontrol edelim
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
      .select(PROJECT_SELECT_FIELDS)
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
    if (data.programId !== undefined) updateData.program_id = data.programId;
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

    // Soft delete: deleted_at set et
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null); // Sadece silinmemiş olanları sil

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  async restore(id: string): Promise<void> {
    const supabase = await createClient();

    // Soft delete geri al: deleted_at'i NULL yap
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: null })
      .eq('id', id)
      .not('deleted_at', 'is', null); // Sadece silinmiş olanları geri yükle

    if (error) {
      throw new Error(`Failed to restore project: ${error.message}`);
    }
  }

  async findDeleted(): Promise<Project[]> {
    const supabase = await createClient();

    const { data: projects, error } = await supabase
      .from('projects')
      .select(PROJECT_SELECT_FIELDS)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find deleted projects: ${error.message}`);
    }

    return projects?.map((p) => this.mapToEntity(p)) || [];
  }

  async exists(id: string, includeDeleted: boolean = false): Promise<boolean> {
    const supabase = await createClient();

    let query = supabase.from('projects').select('id').eq('id', id);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.single();

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
      programId: data.program_id ?? null,
      companyName: data.company?.name ?? data.company_name ?? null,
      consultantName:
        data.consultant?.full_name ?? data.consultant_full_name ?? data.consultant?.email ?? null,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.start_date ? new Date(data.start_date) : null,
      endDate: data.end_date ? new Date(data.end_date) : null,
      progress: data.progress,
      isTemplate: data.is_template,
      templateId: data.template_id,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
