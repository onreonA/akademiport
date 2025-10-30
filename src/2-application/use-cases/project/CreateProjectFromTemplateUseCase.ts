import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export interface CreateProjectFromTemplateDto {
  templateId: string;
  companyId: string;
  consultantId?: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export class CreateProjectFromTemplateUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private subProjectRepository: ISubProjectRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(data: CreateProjectFromTemplateDto): Promise<Result<{ id: string }>> {
    try {
      // Get template
      const template = await this.projectRepository.findById(data.templateId);
      if (!template) {
        return Result.fail(new AppError('Template not found', 404));
      }

      if (!template.isTemplate) {
        return Result.fail(new AppError('Project is not a template', 400));
      }

      // Create new project from template
      const newProject = await this.projectRepository.create({
        companyId: data.companyId,
        consultantId: data.consultantId,
        name: data.name,
        description: data.description || template.description,
        status: 'todo',
        priority: template.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        isTemplate: false,
        templateId: template.id,
      });

      // Copy sub-projects from template
      const templateSubProjects = await this.subProjectRepository.findByProjectId(template.id);

      for (const subProject of templateSubProjects) {
        const newSubProject = await this.subProjectRepository.create({
          projectId: newProject.id,
          name: subProject.name,
          description: subProject.description,
          status: 'todo',
          orderIndex: subProject.orderIndex,
        });

        // Copy tasks from template sub-project
        const templateTasks = await this.taskRepository.findBySubProjectId(subProject.id);

        for (const task of templateTasks) {
          await this.taskRepository.create({
            subProjectId: newSubProject.id,
            title: task.title,
            description: task.description,
            status: 'todo',
            priority: task.priority,
            orderIndex: task.orderIndex,
          });
        }
      }

      return Result.ok({ id: newProject.id });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to create project from template',
          500
        )
      );
    }
  }
}
