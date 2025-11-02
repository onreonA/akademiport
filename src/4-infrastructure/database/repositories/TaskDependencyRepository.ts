import { ITaskDependencyRepository } from '@/domain/interfaces/repositories/ITaskDependencyRepository';
import {
  TaskDependency,
  CreateTaskDependencyDto,
  UpdateTaskDependencyDto,
} from '@/domain/entities/TaskDependency';
import { createClient } from '@/infrastructure/database/supabase-server';

export class TaskDependencyRepository implements ITaskDependencyRepository {
  async create(data: CreateTaskDependencyDto): Promise<TaskDependency> {
    const supabase = await createClient();

    const { data: dependency, error } = await supabase
      .from('task_dependencies')
      .insert({
        task_id: data.taskId,
        depends_on_task_id: data.dependsOnTaskId,
        dependency_type: data.dependencyType || 'blocks',
      })
      .select()
      .single();

    if (error) {
      // Circular dependency hatası özel mesaj
      if (error.message.includes('circular dependency') || error.message.includes('Circular')) {
        throw new Error('Döngüsel bağımlılık tespit edildi. Bu bağımlılık eklenemez.');
      }
      throw new Error(`Failed to create task dependency: ${error.message}`);
    }

    return this.mapToEntity(dependency);
  }

  async findById(id: string): Promise<TaskDependency | null> {
    const supabase = await createClient();

    const { data: dependency, error } = await supabase
      .from('task_dependencies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find task dependency: ${error.message}`);
    }

    return this.mapToEntity(dependency);
  }

  async findByTaskId(taskId: string): Promise<TaskDependency[]> {
    const supabase = await createClient();

    const { data: dependencies, error } = await supabase
      .from('task_dependencies')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find task dependencies: ${error.message}`);
    }

    return dependencies?.map((d) => this.mapToEntity(d)) || [];
  }

  async findDependenciesOfTask(taskId: string): Promise<TaskDependency[]> {
    // Bu görev hangi görevlere bağımlı (task_id = taskId)
    return this.findByTaskId(taskId);
  }

  async findDependentTasks(taskId: string): Promise<TaskDependency[]> {
    // Bu göreve hangi görevler bağımlı (depends_on_task_id = taskId)
    const supabase = await createClient();

    const { data: dependencies, error } = await supabase
      .from('task_dependencies')
      .select('*')
      .eq('depends_on_task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find dependent tasks: ${error.message}`);
    }

    return dependencies?.map((d) => this.mapToEntity(d)) || [];
  }

  async exists(taskId: string, dependsOnTaskId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('task_dependencies')
      .select('id')
      .eq('task_id', taskId)
      .eq('depends_on_task_id', dependsOnTaskId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check task dependency existence: ${error.message}`);
    }

    return !!data;
  }

  async checkCircularDependency(taskId: string, dependsOnTaskId: string): Promise<boolean> {
    // Basit kontrol: depends_on_task_id, task_id'ye bağımlı mı?
    const exists = await this.exists(dependsOnTaskId, taskId);
    if (exists) {
      return true; // Circular dependency var
    }

    // Daha derin kontrol: depends_on_task_id'nin bağımlı olduğu görevler task_id'ye kadar gelir mi?
    // Recursive kontrol (max depth: 10)
    const visited = new Set<string>();
    const queue: string[] = [dependsOnTaskId];
    let depth = 0;
    const MAX_DEPTH = 10;

    while (queue.length > 0 && depth < MAX_DEPTH) {
      depth++;
      const currentTaskId = queue.shift()!;

      if (visited.has(currentTaskId)) {
        continue;
      }
      visited.add(currentTaskId);

      // Eğer task_id'ye ulaşırsak circular dependency var
      if (currentTaskId === taskId) {
        return true;
      }

      // Bu görevin bağımlı olduğu görevleri bul
      const dependencies = await this.findDependenciesOfTask(currentTaskId);
      for (const dep of dependencies) {
        queue.push(dep.dependsOnTaskId);
      }
    }

    return false; // Circular dependency yok
  }

  async update(id: string, data: UpdateTaskDependencyDto): Promise<TaskDependency> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.dependencyType !== undefined) {
      updateData.dependency_type = data.dependencyType;
    }

    const { data: dependency, error } = await supabase
      .from('task_dependencies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task dependency: ${error.message}`);
    }

    return this.mapToEntity(dependency);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('task_dependencies').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete task dependency: ${error.message}`);
    }
  }

  async deleteByTaskId(taskId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('task_dependencies').delete().eq('task_id', taskId);

    if (error) {
      throw new Error(`Failed to delete task dependencies by task ID: ${error.message}`);
    }
  }

  private mapToEntity(data: any): TaskDependency {
    return {
      id: data.id,
      taskId: data.task_id,
      dependsOnTaskId: data.depends_on_task_id,
      dependencyType: data.dependency_type,
      createdAt: new Date(data.created_at),
    };
  }
}
