import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class LikeTopicUseCase {
  constructor(
    private forumRepository: IForumRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(topicId: string, userId: string, companyId?: string): Promise<Result<void>> {
    try {
      // Check if topic exists
      const topicResult = await this.forumRepository.findTopicById(topicId);
      if (topicResult.isFailure || !topicResult.value) {
        return Result.fail('Konu bulunamadı');
      }

      const topic = topicResult.value;

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

      // Add leaderboard score for topic author (not the liker)
      if (this.addLeaderboardScore && companyId && topic.companyId) {
        await this.addLeaderboardScore.execute({
          companyId: topic.companyId, // Topic author's company gets the points
          activityType: ActivityType.FORUM_TOPIC_LIKED,
          activityId: topicId,
          metadata: {
            topicId,
            topicTitle: topic.title,
            likedBy: userId,
          },
        });
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Konu beğenilemedi');
    }
  }
}
