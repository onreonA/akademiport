import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';

export class UnlikeReplyUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(replyId: string, userId: string): Promise<Result<void>> {
    try {
      const result = await this.forumRepository.unlikeReply(replyId, userId);

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

