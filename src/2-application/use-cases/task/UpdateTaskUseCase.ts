import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { UpdateTaskDto } from '@/3-domain/entities/Task';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class UpdateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private taskDependencyRepository?: ITaskDependencyRepository
  ) {}

  async execute(id: string, data: UpdateTaskDto): Promise<Result<void>> {
    try {
      // Check if task exists
      const task = await this.taskRepository.findById(id);
      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // If status is being changed to 'in_progress', check dependencies
      if (
        data.status === 'in_progress' &&
        task.status !== 'in_progress' &&
        this.taskDependencyRepository
      ) {
        // Get blocking dependencies (zorunlu bağımlılıklar)
        const dependencies = await this.taskDependencyRepository.findDependenciesOfTask(id);
        const blockingDependencies = dependencies.filter((dep) => dep.dependencyType === 'blocks');

        // Check if all blocking dependencies are completed
        if (blockingDependencies.length > 0) {
          const incompleteDependencies: string[] = [];

          for (const dependency of blockingDependencies) {
            const dependsOnTask = await this.taskRepository.findById(dependency.dependsOnTaskId);
            if (!dependsOnTask || dependsOnTask.status !== 'done') {
              incompleteDependencies.push(dependency.dependsOnTaskId);
            }
          }

          if (incompleteDependencies.length > 0) {
            return Result.fail(
              new AppError(
                `Bu görev, tamamlanmamış bağımlı görevlere sahip. Lütfen önce bağımlı görevleri tamamlayın. (${incompleteDependencies.length} görev eksik)`,
                400
              )
            );
          }
        }
      }

      // Update task
      await this.taskRepository.update(id, data);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update task', 500)
      );
    }
  }
}
