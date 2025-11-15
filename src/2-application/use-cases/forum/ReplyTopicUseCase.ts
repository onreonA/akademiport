import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { CreateReplyDto } from '@/2-application/dtos/forum/CreateReplyDto';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class ReplyTopicUseCase {
  constructor(
    private forumRepository: IForumRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(
    dto: CreateReplyDto,
    userId: string,
    companyId: string
  ): Promise<Result<{ id: string }>> {
    try {
      // Check if topic exists
      const topicResult = await this.forumRepository.findTopicById(dto.topicId);
      if (topicResult.isFailure || !topicResult.value) {
        return Result.fail('Konu bulunamadı');
      }

      const topic = topicResult.value;

      // Check if topic can be replied to
      if (topic.isLocked) {
        return Result.fail('Bu konu kilitli, yanıt yazılamaz');
      }

      if (topic.status !== 'open') {
        return Result.fail('Bu konuya yanıt yazılamaz');
      }

      if (!topic.isApproved) {
        return Result.fail('Bu konu henüz onaylanmamış');
      }

      // Check if parent reply exists (for nested replies)
      if (dto.parentId) {
        const parentReplyResult = await this.forumRepository.findReplyById(dto.parentId);
        if (parentReplyResult.isFailure || !parentReplyResult.value) {
          return Result.fail('Yanıtlanacak yanıt bulunamadı');
        }

        if (parentReplyResult.value.topicId !== dto.topicId) {
          return Result.fail('Yanıt farklı bir konuya ait');
        }
      }

      // Validate content
      if (!dto.content || dto.content.trim().length === 0) {
        return Result.fail('Yanıt içeriği gereklidir');
      }

      // Create reply
      const result = await this.forumRepository.createReply({
        topicId: dto.topicId,
        authorId: userId,
        companyId,
        parentId: dto.parentId || null,
        content: dto.content.trim(),
        isApproved: true,
        isSolution: false,
      });

      if (result.isFailure) {
        return Result.fail(result.error || 'Yanıt oluşturulamadı');
      }

      // Create notification for topic author (if not the same user)
      if (topic.authorId !== userId) {
        await this.forumRepository.createNotification({
          userId: topic.authorId,
          topicId: dto.topicId,
          replyId: result.value.id,
          type: 'new_reply',
          title: 'Konunuza yeni bir yanıt geldi',
          message: `"${topic.title}" konunuza yeni bir yanıt yazıldı.`,
        });
      }

      // Add leaderboard score
      if (this.addLeaderboardScore) {
        await this.addLeaderboardScore.execute({
          companyId,
          activityType: ActivityType.FORUM_REPLY_CREATED,
          activityId: result.value.id,
          metadata: {
            topicId: dto.topicId,
            topicTitle: topic.title,
            isNested: !!dto.parentId,
          },
        });
      }

      return Result.ok({ id: result.value.id });
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Yanıt oluşturulamadı'
      );
    }
  }
}

