import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';

export class DeleteReplyUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(replyId: string, userId: string, isAdmin: boolean = false): Promise<Result<void>> {
    try {
      // Check if reply exists
      const replyResult = await this.forumRepository.findReplyById(replyId);

      if (replyResult.isFailure || !replyResult.value) {
        return Result.fail('Yanıt bulunamadı');
      }

      const reply = replyResult.value;

      // Only author or admin can delete
      if (reply.authorId !== userId && !isAdmin) {
        return Result.fail('Bu yanıtı silme yetkiniz yok');
      }

      const result = await this.forumRepository.deleteReply(replyId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Yanıt silinemedi');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Yanıt silinemedi'
      );
    }
  }
}

