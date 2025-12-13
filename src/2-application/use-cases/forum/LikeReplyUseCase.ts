import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class LikeReplyUseCase {
  constructor(
    private forumRepository: IForumRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(replyId: string, userId: string, companyId?: string): Promise<Result<void>> {
    try {
      // Check if reply exists
      const replyResult = await this.forumRepository.findReplyById(replyId);
      if (replyResult.isFailure || !replyResult.value) {
        return Result.fail('Yanıt bulunamadı');
      }

      const reply = replyResult.value;

      // Check if already liked
      const isLikedResult = await this.forumRepository.isReplyLikedByUser(replyId, userId);
      if (isLikedResult.isSuccess && isLikedResult.value) {
        return Result.fail('Bu yanıtı zaten beğendiniz');
      }

      const result = await this.forumRepository.likeReply(replyId, userId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Beğeni eklenemedi');
      }

      // Add leaderboard score for reply author (not the liker)
      if (this.addLeaderboardScore && companyId && reply.companyId) {
        await this.addLeaderboardScore.execute({
          companyId: reply.companyId, // Reply author's company gets the points
          activityType: ActivityType.FORUM_REPLY_LIKED,
          activityId: replyId,
          metadata: {
            replyId,
            topicId: reply.topicId,
            likedBy: userId,
          },
        });
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Beğeni eklenemedi');
    }
  }
}
