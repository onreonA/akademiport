import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';

export class LikeReplyUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(replyId: string, userId: string): Promise<Result<void>> {
    try {
      const result = await this.forumRepository.likeReply(replyId, userId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Beğeni eklenemedi');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Beğeni eklenemedi'
      );
    }
  }
}

