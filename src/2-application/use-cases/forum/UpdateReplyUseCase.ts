import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { UpdateReplyDto } from '@/2-application/dtos/forum';

export class UpdateReplyUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(replyId: string, dto: UpdateReplyDto, userId: string): Promise<Result<{ id: string }>> {
    try {
      // Check if reply exists and user is author
      const replyResult = await this.forumRepository.findReplyById(replyId);

      if (replyResult.isFailure || !replyResult.value) {
        return Result.fail('Yanıt bulunamadı');
      }

      const reply = replyResult.value;

      if (reply.authorId !== userId) {
        return Result.fail('Bu yanıtı düzenleme yetkiniz yok');
      }

      const result = await this.forumRepository.updateReply(replyId, {
        content: dto.content,
        isEdited: true,
      });

      if (result.isFailure) {
        return Result.fail(result.error || 'Yanıt güncellenemedi');
      }

      return Result.ok({ id: result.value.id });
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Yanıt güncellenemedi'
      );
    }
  }
}

