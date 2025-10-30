import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/domain/entities/Project';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export interface ListProjectsFilters {
  companyId?: string;
  consultantId?: string;
  status?: string;
  isTemplate?: boolean;
  page?: number;
  limit?: number;
}

export class ListProjectsUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(
    filters?: ListProjectsFilters
  ): Promise<Result<{ data: Project[]; total: number; page: number; limit: number }>> {
    try {
      const result = await this.projectRepository.findAll(filters);

      return Result.ok({
        data: result.data,
        total: result.total,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
      });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list projects', 500)
      );
    }
  }
}
