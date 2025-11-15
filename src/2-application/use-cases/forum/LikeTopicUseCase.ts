import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';

export class LikeTopicUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(topicId: string, userId: string): Promise<Result<void>> {
    try {
      // Check if topic exists
      const topicResult = await this.forumRepository.findTopicById(topicId);
      if (topicResult.isFailure || !topicResult.value) {
        return Result.fail('Konu bulunamadı');
      }

      // Check if already liked
      const isLikedResult = await this.forumRepository.isTopicLikedByUser(topicId, userId);
      if (isLikedResult.isSuccess && isLikedResult.value) {
        return Result.fail('Bu konuyu zaten beğendiniz');
      }

      // Like topic
      const result = await this.forumRepository.likeTopic(topicId, userId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Konu beğenilemedi');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Konu beğenilemedi'
      );
    }
  }
}

