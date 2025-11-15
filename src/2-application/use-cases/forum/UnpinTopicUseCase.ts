import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';

export class UnpinTopicUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(topicId: string): Promise<Result<void>> {
    try {
      const result = await this.forumRepository.unpinTopic(topicId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Sabitleme kaldırılamadı');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Sabitleme kaldırılamadı'
      );
    }
  }
}

