import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { Task } from '@/domain/entities/Task';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

/**
 * List Consultant Tasks Use Case
 *
 * Consultant'ın atandığı projelerdeki TÜM görevleri listeler (tüm durumlar)
 */
export class ListConsultantTasksUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private projectRepository: IProjectRepository,
    private subProjectRepository: ISubProjectRepository
  ) {}

  async execute(
    consultantId: string,
    filters?: { status?: string; page?: number; limit?: number }
  ): Promise<
    Result<{ tasks: Task[]; total: number; page: number; limit: number; totalPages: number }>
  > {
    try {
      // Pagination parametreleri
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const offset = (page - 1) * limit;

      // 1. Consultant'ın projelerini bul
      const projects = await this.projectRepository.findByConsultantId(consultantId);

      if (projects.length === 0) {
        return Result.ok({ tasks: [], total: 0, page, limit, totalPages: 0 });
      }

      // 2. Bu projelerdeki sub-projeleri bul
      const projectIds = projects.map((p) => p.id);
      const allSubProjects: string[] = [];

      for (const projectId of projectIds) {
        const subProjects = await this.subProjectRepository.findByProjectId(projectId);
        allSubProjects.push(...subProjects.map((sp) => sp.id));
      }

      if (allSubProjects.length === 0) {
        return Result.ok({ tasks: [], total: 0, page, limit, totalPages: 0 });
      }

      // 3. Bu sub-projelerdeki görevleri bul (tüm durumlarda veya filtreli)
      const { createClient } = await import('@/infrastructure/database/supabase-server');
      const supabase = await createClient();

      // Önce toplam sayıyı al
      let countQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('sub_project_id', allSubProjects)
        .is('deleted_at', null);

      if (filters?.status) {
        countQuery = countQuery.eq('status', filters.status);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(`Failed to count tasks: ${countError.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      // Sonra sayfalı veriyi al
      let query = supabase
        .from('tasks')
        .select(
          `
          *,
          sub_projects (
            id,
            name,
            projects (
              id,
              name,
              companies (
                id,
                name
              )
            )
          ),
          users!tasks_assigned_to_fkey (
            id,
            full_name,
            email
          )
        `
        )
        .in('sub_project_id', allSubProjects)
        .is('deleted_at', null);

      // Durum filtresi varsa uygula
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data: tasks, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to find tasks: ${error.message}`);
      }

      // 4. Task entity'lerine map et ve frontend formatına çevir
      const taskEntities = (tasks || []).map((task: any) => {
        return {
          id: task.id,
          subProjectId: task.sub_project_id,
          assignedTo: task.assigned_to,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          orderIndex: task.order_index || 0,
          completedAt: task.completed_at ? new Date(task.completed_at) : null,
          completed_at: task.completed_at ? new Date(task.completed_at).toISOString() : undefined,
          approvedAt: task.approved_at ? new Date(task.approved_at) : null,
          approvedBy: task.approved_by,
          createdAt: task.created_at ? new Date(task.created_at) : new Date(),
          updatedAt: task.updated_at ? new Date(task.updated_at) : new Date(),
          deletedAt: task.deleted_at ? new Date(task.deleted_at) : null,
          // Frontend için ek bilgiler
          sub_project: task.sub_projects
            ? {
                id: task.sub_projects.id,
                name: task.sub_projects.name,
                project: task.sub_projects.projects
                  ? {
                      id: task.sub_projects.projects.id,
                      name: task.sub_projects.projects.name,
                      company: task.sub_projects.projects.companies
                        ? {
                            id: task.sub_projects.projects.companies.id,
                            name: task.sub_projects.projects.companies.name,
                          }
                        : null,
                    }
                  : null,
              }
            : null,
          assigned_user: task.users
            ? {
                id: task.users.id,
                full_name: task.users.full_name,
                email: task.users.email,
              }
            : null,
        };
      });

      return Result.ok({
        tasks: taskEntities as any,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to list consultant tasks',
          500
        )
      );
    }
  }
}
