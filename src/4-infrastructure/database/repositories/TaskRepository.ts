import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Task, CreateTaskDto, UpdateTaskDto } from '@/domain/entities/Task';
import { createClient } from '@/infrastructure/database/supabase-server';

export class TaskRepository implements ITaskRepository {
  async create(data: CreateTaskDto): Promise<Task> {
    const supabase = await createClient();

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        sub_project_id: data.subProjectId,
        assigned_to: data.assignedTo || null,
        title: data.title,
        description: data.description || null,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        due_date: data.dueDate || null,
        order_index: data.orderIndex || 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return this.mapToEntity(task);
  }

  async findById(id: string, includeDeleted: boolean = false): Promise<Task | null> {
    const supabase = await createClient();

    let query = supabase.from('tasks').select('*').eq('id', id);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: task, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find task: ${error.message}`);
    }

    return this.mapToEntity(task);
  }

  async findBySubProjectId(subProjectId: string, includeDeleted: boolean = false): Promise<Task[]> {
    const supabase = await createClient();

    let query = supabase.from('tasks').select('*').eq('sub_project_id', subProjectId);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: tasks, error } = await query.order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to find tasks: ${error.message}`);
    }

    return tasks?.map((t) => this.mapToEntity(t)) || [];
  }

  async findBySubProjectIds(
    subProjectIds: string[],
    includeDeleted: boolean = false
  ): Promise<Task[]> {
    if (subProjectIds.length === 0) {
      return [];
    }

    const supabase = await createClient();

    let query = supabase.from('tasks').select('*').in('sub_project_id', subProjectIds);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: tasks, error } = await query.order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to find tasks by sub-project IDs: ${error.message}`);
    }

    return tasks?.map((t) => this.mapToEntity(t)) || [];
  }

  async findByAssignedUserId(
    userId: string,
    filters?: { status?: string; priority?: string },
    includeDeleted: boolean = false
  ): Promise<Task[]> {
    const supabase = await createClient();

    let query = supabase.from('tasks').select('*').eq('assigned_to', userId);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    query = query.order('due_date', { ascending: true, nullsFirst: false });

    const { data: tasks, error } = await query;

    if (error) {
      throw new Error(`Failed to find assigned tasks: ${error.message}`);
    }

    return tasks?.map((t) => this.mapToEntity(t)) || [];
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return this.mapToEntity(task);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    // Soft delete: deleted_at set et
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async restore(id: string): Promise<void> {
    const supabase = await createClient();

    // Soft delete geri al
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: null })
      .eq('id', id)
      .not('deleted_at', 'is', null);

    if (error) {
      throw new Error(`Failed to restore task: ${error.message}`);
    }
  }

  async findDeleted(): Promise<Task[]> {
    const supabase = await createClient();

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find deleted tasks: ${error.message}`);
    }

    return tasks?.map((t) => this.mapToEntity(t)) || [];
  }

  async exists(id: string, includeDeleted: boolean = false): Promise<boolean> {
    const supabase = await createClient();

    let query = supabase.from('tasks').select('id').eq('id', id);

    // Soft delete kontrolü
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check task existence: ${error.message}`);
    }

    return !!data;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);

    if (error) {
      throw new Error(`Failed to update task status: ${error.message}`);
    }
  }

  async complete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'review',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to complete task: ${error.message}`);
    }
  }

  async approve(id: string, approvedBy: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'done',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to approve task: ${error.message}`);
    }
  }

  async reject(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        completed_at: null,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to reject task: ${error.message}`);
    }
  }

  async assignTo(id: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('tasks').update({ assigned_to: userId }).eq('id', id);

    if (error) {
      throw new Error(`Failed to assign task: ${error.message}`);
    }
  }

  async updateOrder(id: string, orderIndex: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('tasks').update({ order_index: orderIndex }).eq('id', id);

    if (error) {
      throw new Error(`Failed to update task order: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Task {
    return {
      id: data.id,
      subProjectId: data.sub_project_id,
      assignedTo: data.assigned_to,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : null,
      approvedAt: data.approved_at ? new Date(data.approved_at) : null,
      approvedBy: data.approved_by,
      orderIndex: data.order_index,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
