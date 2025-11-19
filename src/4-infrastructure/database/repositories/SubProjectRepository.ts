import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { SubProject, CreateSubProjectDto, UpdateSubProjectDto } from '@/domain/entities/SubProject';
import { createClient } from '@/infrastructure/database/supabase-server';

export class SubProjectRepository implements ISubProjectRepository {
  async create(data: CreateSubProjectDto): Promise<SubProject> {
    const supabase = await createClient();

    const { data: subProject, error } = await supabase
      .from('sub_projects')
      .insert({
        project_id: data.projectId,
        name: data.name,
        description: data.description || null,
        status: data.status || 'todo',
        order_index: data.orderIndex || 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create sub-project: ${error.message}`);
    }

    return this.mapToEntity(subProject);
  }

  async findById(id: string, includeDeleted: boolean = false): Promise<SubProject | null> {
    const supabase = await createClient();

    let query = supabase.from('sub_projects').select('*').eq('id', id);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: subProject, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find sub-project: ${error.message}`);
    }

    return this.mapToEntity(subProject);
  }

  async findByProjectId(projectId: string, includeDeleted: boolean = false): Promise<SubProject[]> {
    const supabase = await createClient();

    let query = supabase.from('sub_projects').select('*').eq('project_id', projectId);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: subProjects, error } = await query.order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to find sub-projects: ${error.message}`);
    }

    return subProjects?.map((sp) => this.mapToEntity(sp)) || [];
  }

  async update(id: string, data: UpdateSubProjectDto): Promise<SubProject> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
    if (data.progress !== undefined) updateData.progress = data.progress;

    const { data: subProject, error } = await supabase
      .from('sub_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update sub-project: ${error.message}`);
    }

    return this.mapToEntity(subProject);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    // Soft delete: deleted_at set et
    const { error } = await supabase
      .from('sub_projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete sub-project: ${error.message}`);
    }
  }

  async restore(id: string): Promise<void> {
    const supabase = await createClient();

    // Soft delete geri al
    const { error } = await supabase
      .from('sub_projects')
      .update({ deleted_at: null })
      .eq('id', id)
      .not('deleted_at', 'is', null);

    if (error) {
      throw new Error(`Failed to restore sub-project: ${error.message}`);
    }
  }

  async findDeleted(): Promise<SubProject[]> {
    const supabase = await createClient();

    const { data: subProjects, error } = await supabase
      .from('sub_projects')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find deleted sub-projects: ${error.message}`);
    }

    return subProjects?.map((sp) => this.mapToEntity(sp)) || [];
  }

  async exists(id: string, includeDeleted: boolean = false): Promise<boolean> {
    const supabase = await createClient();

    let query = supabase.from('sub_projects').select('id').eq('id', id);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check sub-project existence: ${error.message}`);
    }

    return !!data;
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('sub_projects').update({ progress }).eq('id', id);

    if (error) {
      throw new Error(`Failed to update sub-project progress: ${error.message}`);
    }
  }

  async updateOrder(id: string, orderIndex: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('sub_projects')
      .update({ order_index: orderIndex })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update sub-project order: ${error.message}`);
    }
  }

  private mapToEntity(data: any): SubProject {
    return {
      id: data.id,
      projectId: data.project_id,
      name: data.name,
      description: data.description,
      status: data.status,
      orderIndex: data.order_index,
      progress: data.progress,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
