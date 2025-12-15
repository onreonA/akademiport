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

    // Eğer companyId filtresi varsa, hem projects.company_id hem de company_project_assignments tablosunu kontrol et
    if (filters?.companyId) {
      // İki sorgu yap: 1) company_id'ye göre, 2) company_project_assignments'e göre
      const companyId = filters.companyId;

      // 1. projects.company_id = companyId olan projeleri bul
      let query1 = supabase
        .from('projects')
        .select(PROJECT_SELECT_FIELDS)
        .eq('company_id', companyId);

      // 2. company_project_assignments tablosunda companyId'ye atanmış projeleri bul
      const { data: assignments } = await supabase
        .from('company_project_assignments')
        .select('project_id')
        .eq('company_id', companyId)
        .eq('is_active', true);

      const assignedProjectIds = assignments?.map((a) => a.project_id) || [];

      // Soft delete kontrolü
      if (!filters?.includeDeleted) {
        query1 = query1.is('deleted_at', null);
      }

      // Status filtresi
      if (filters?.status) {
        query1 = query1.eq('status', filters.status);
      }

      // Template filtresi
      if (filters?.isTemplate !== undefined) {
        query1 = query1.eq('is_template', filters.isTemplate);
      } else {
        query1 = query1.eq('is_template', false);
      }

      const { data: projects1, error: error1 } = await query1;

      // 2. Atanmış projeleri bul (eğer varsa)
      let projects2: any[] = [];
      if (assignedProjectIds.length > 0) {
        let query2 = supabase
          .from('projects')
          .select(PROJECT_SELECT_FIELDS)
          .in('id', assignedProjectIds);

        // Soft delete kontrolü
        if (!filters?.includeDeleted) {
          query2 = query2.is('deleted_at', null);
        }

        // Status filtresi
        if (filters?.status) {
          query2 = query2.eq('status', filters.status);
        }

        // Template filtresi
        if (filters?.isTemplate !== undefined) {
          query2 = query2.eq('is_template', filters.isTemplate);
        } else {
          query2 = query2.eq('is_template', false);
        }

        const { data: data2, error: error2 } = await query2;
        if (error2) {
          throw new Error(`Failed to find assigned projects: ${error2.message}`);
        }
        projects2 = data2 || [];
      }

      if (error1) {
        throw new Error(`Failed to find projects: ${error1.message}`);
      }

      // İki listeyi birleştir ve duplicate'leri kaldır
      const allProjects = [...(projects1 || []), ...projects2];
      const uniqueProjects = Array.from(new Map(allProjects.map((p) => [p.id, p])).values());

      // Sırala ve pagination uygula
      uniqueProjects.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      const paginatedProjects = uniqueProjects.slice(offset, offset + limit);

      return {
        data: paginatedProjects.map((p) => this.mapToEntity(p)),
        total: uniqueProjects.length,
      };
    }

    // Normal sorgu (companyId filtresi yoksa)
    let query = supabase.from('projects').select(PROJECT_SELECT_FIELDS, { count: 'exact' });

    // Soft delete kontrolü: includeDeleted true değilse sadece silinmemişleri getir
    if (!filters?.includeDeleted) {
      query = query.is('deleted_at', null);
    }

    if (filters?.consultantId) {
      query = query.eq('consultant_id', filters.consultantId);

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/ab0a7b4f-c491-4309-8654-c71caae1abf6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'ProjectRepository.ts:180',
          message: 'Consultant filter applied in repository',
          data: { consultantId: filters.consultantId },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'B,E',
        }),
      }).catch(() => {});
      // #endregion
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

    // Check all projects in database to see consultant_id values
    const { data: allProjectsSample } = await supabase
      .from('projects')
      .select('id, name, consultant_id, is_template, deleted_at')
      .eq('is_template', false)
      .is('deleted_at', null)
      .limit(20);

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/ab0a7b4f-c491-4309-8654-c71caae1abf6', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'ProjectRepository.ts:198',
        message: 'Database query result',
        data: {
          hasError: !!error,
          errorMessage: error?.message || null,
          projectsCount: projects?.length || 0,
          count,
          filters: {
            consultantId: filters?.consultantId,
            status: filters?.status,
            isTemplate: filters?.isTemplate,
          },
          allProjectsSample: allProjectsSample?.map((p) => ({
            id: p.id,
            name: p.name,
            consultant_id: p.consultant_id,
          })),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {});
    // #endregion

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
