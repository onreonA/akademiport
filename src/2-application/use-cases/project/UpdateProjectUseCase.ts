import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { UpdateProjectDto } from '@/3-domain/entities/Project';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class UpdateProjectUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(id: string, data: UpdateProjectDto): Promise<Result<void>> {
    try {
      // Check if project exists and get current state
      const existingProject = await this.projectRepository.findById(id);
      if (!existingProject) {
        return Result.fail(new AppError('Project not found', 404));
      }

      // Check if project is being completed (status becomes 'done' and progress is 100)
      const isBeingCompleted =
        (data.status === 'done' || (data.progress === 100 && data.status !== 'done')) &&
        existingProject.status !== 'done' &&
        existingProject.companyId;

      // Update project
      await this.projectRepository.update(id, data);

      // Add leaderboard bonus score if project was completed
      if (isBeingCompleted && this.addLeaderboardScore && existingProject.companyId) {
        // Get updated project to verify completion
        const updatedProject = await this.projectRepository.findById(id);
        if (updatedProject && updatedProject.status === 'done' && updatedProject.progress === 100) {
          await this.addLeaderboardScore.execute({
            companyId: existingProject.companyId,
            activityType: ActivityType.PROJECT_COMPLETED,
            activityId: id,
            metadata: {
              projectId: id,
              projectName: updatedProject.name,
              completedAt: new Date().toISOString(),
            },
          });
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update project', 500)
      );
    }
  }
}
