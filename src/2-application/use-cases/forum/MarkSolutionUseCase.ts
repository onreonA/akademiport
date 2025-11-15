import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class MarkSolutionUseCase {
  constructor(
    private forumRepository: IForumRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(topicId: string, replyId: string, userId: string): Promise<Result<void>> {
    try {
      // Get topic
      const topicResult = await this.forumRepository.findTopicById(topicId);
      if (topicResult.isFailure || !topicResult.value) {
        return Result.fail('Konu bulunamadı');
      }

      const topic = topicResult.value;

      // Check if user is author or consultant/admin
      // Note: We'll need to check user role from user repository
      // For now, we'll allow topic author and check role in API route
      const isAuthor = topic.authorId === userId;

      if (!isAuthor) {
        // Check if user is consultant/admin (will be checked in API route)
        // For now, return error
        return Result.fail('Sadece konu sahibi veya danışman çözüm işaretleyebilir');
      }

      // Check if reply exists
      const replyResult = await this.forumRepository.findReplyById(replyId);
      if (replyResult.isFailure || !replyResult.value) {
        return Result.fail('Yanıt bulunamadı');
      }

      const reply = replyResult.value;

      if (reply.topicId !== topicId) {
        return Result.fail('Yanıt bu konuya ait değil');
      }

      // Mark solution
      const result = await this.forumRepository.markSolution(topicId, replyId, userId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Çözüm işaretlenemedi');
      }

      // Create notification for reply author
      if (reply.authorId !== userId) {
        await this.forumRepository.createNotification({
          userId: reply.authorId,
          topicId,
          replyId,
          type: 'solution_marked',
          title: 'Yanıtınız çözüm olarak işaretlendi',
          message: `"${topic.title}" konusundaki yanıtınız çözüm olarak işaretlendi. +20 puan kazandınız!`,
        });
      }

      // Add leaderboard score for reply author (solution marker)
      if (this.addLeaderboardScore && reply.companyId) {
        await this.addLeaderboardScore.execute({
          companyId: reply.companyId,
          activityType: ActivityType.FORUM_SOLUTION_MARKED,
          activityId: replyId,
          metadata: {
            topicId,
            topicTitle: topic.title,
            markedBy: userId,
          },
        });
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Çözüm işaretlenemedi');
    }
  }
}
