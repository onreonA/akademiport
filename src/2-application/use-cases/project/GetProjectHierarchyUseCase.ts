/**
 * Get Project Hierarchy Use Case
 * Sprint 8 Extension: Fetch project with all sub-projects and tasks in one call
 */

import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import {
  ProjectHierarchyDTO,
  SubProjectWithTasksDTO,
  TaskDTO,
} from '@/application/dto/project-hierarchy.dto';

export class GetProjectHierarchyUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private subProjectRepository: ISubProjectRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(projectId: string): Promise<Result<ProjectHierarchyDTO>> {
    try {
      console.log('🔍 [GetProjectHierarchyUseCase] Fetching hierarchy for project:', projectId);

      // 1. Fetch project
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        return Result.fail(new AppError('Project not found', 404));
      }

      // 2. Fetch all sub-projects (sorted by order_index)
      const subProjects = await this.subProjectRepository.findByProjectId(projectId);
      console.log('📁 [GetProjectHierarchyUseCase] Found sub-projects:', subProjects.length);

      // 3. Fetch all tasks for all sub-projects
      const subProjectIds = subProjects.map((sp) => sp.id);
      let allTasks: any[] = [];

      if (subProjectIds.length > 0) {
        allTasks = await this.taskRepository.findBySubProjectIds(subProjectIds);
        console.log('📋 [GetProjectHierarchyUseCase] Found tasks:', allTasks.length);
      }

      // 4. Group tasks by sub-project and calculate stats
      const subProjectsWithTasks: SubProjectWithTasksDTO[] = subProjects.map((subProject) => {
        const tasks = allTasks.filter((task) => task.subProjectId === subProject.id);
        const completedTasks = tasks.filter((t) => t.status === 'done').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
        const todoTasks = tasks.filter((t) => t.status === 'todo').length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        return {
          id: subProject.id,
          name: subProject.name,
          description: subProject.description,
          status: subProject.status,
          progress,
          orderIndex: subProject.orderIndex,
          tasks: tasks
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((task) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              orderIndex: task.orderIndex,
              dueDate: task.dueDate,
              assignedTo: task.assignedTo,
              assignedToName: task.assignedToName,
              subProjectId: task.subProjectId,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
            })),
          stats: {
            totalTasks: tasks.length,
            completedTasks,
            inProgressTasks,
            todoTasks,
          },
          createdAt: subProject.createdAt,
          updatedAt: subProject.updatedAt,
        };
      });

      // 5. Calculate overall stats
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter((t) => t.status === 'done').length;
      const inProgressTasks = allTasks.filter((t) => t.status === 'in_progress').length;
      const todoTasks = allTasks.filter((t) => t.status === 'todo').length;
      const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // 6. Build response DTO
      const hierarchyDTO: ProjectHierarchyDTO = {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          progress: overallProgress,
          startDate: project.startDate,
          endDate: project.endDate,
          companyId: project.companyId,
          companyName: project.companyName,
          consultantId: project.consultantId,
          consultantName: project.consultantName,
          isTemplate: project.isTemplate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        subProjects: subProjectsWithTasks.sort((a, b) => a.orderIndex - b.orderIndex),
        stats: {
          totalSubProjects: subProjects.length,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overallProgress,
        },
      };

      console.log('✅ [GetProjectHierarchyUseCase] Hierarchy built successfully:', {
        subProjects: hierarchyDTO.subProjects.length,
        totalTasks: hierarchyDTO.stats.totalTasks,
        progress: hierarchyDTO.stats.overallProgress,
      });

      return Result.ok(hierarchyDTO);
    } catch (error) {
      console.error('❌ [GetProjectHierarchyUseCase] Error:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to fetch project hierarchy',
          500
        )
      );
    }
  }
}
