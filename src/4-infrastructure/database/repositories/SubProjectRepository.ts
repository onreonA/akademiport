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

  async findById(id: string): Promise<SubProject | null> {
    const supabase = await createClient();

    const { data: subProject, error } = await supabase
      .from('sub_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find sub-project: ${error.message}`);
    }

    return this.mapToEntity(subProject);
  }

  async findByProjectId(projectId: string): Promise<SubProject[]> {
    const supabase = await createClient();

    const { data: subProjects, error } = await supabase
      .from('sub_projects')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

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

    const { error } = await supabase.from('sub_projects').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete sub-project: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('sub_projects').select('id').eq('id', id).single();

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
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
