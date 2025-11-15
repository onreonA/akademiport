import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';

export class UnlikeTopicUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(topicId: string, userId: string): Promise<Result<void>> {
    try {
      // Check if topic exists
      const topicResult = await this.forumRepository.findTopicById(topicId);
      if (topicResult.isFailure || !topicResult.value) {
        return Result.fail('Konu bulunamadı');
      }

      // Unlike topic
      const result = await this.forumRepository.unlikeTopic(topicId, userId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Beğeni kaldırılamadı');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Beğeni kaldırılamadı'
      );
    }
  }
}

