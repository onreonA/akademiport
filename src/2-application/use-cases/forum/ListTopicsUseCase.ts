import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { TopicFilterDto } from '@/2-application/dtos/forum/TopicFilterDto';
import { ForumTopicWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';

export class ListTopicsUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(filters: TopicFilterDto): Promise<Result<{ topics: ForumTopicWithDetails[]; total: number }>> {
    try {
      const repositoryFilters = {
        programId: filters.programId,
        categoryId: filters.categoryId,
        authorId: filters.authorId,
        companyId: filters.companyId,
        status: filters.status,
        priority: filters.priority,
        isPinned: filters.isPinned,
        isLocked: filters.isLocked,
        isApproved: filters.isApproved,
        search: filters.search,
        limit: filters.limit || 20,
        offset: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
      };

      const result = await this.forumRepository.findAllTopics(repositoryFilters);

      if (result.isFailure) {
        return Result.fail(result.error || 'Konular listelenemedi');
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Konular listelenemedi'
      );
    }
  }
}

