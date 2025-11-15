import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { ForumTopic, ForumTopicEntity } from '@/3-domain/entities/Forum';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { CreateTopicDto } from '@/2-application/dtos/forum/CreateTopicDto';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class CreateTopicUseCase {
  constructor(
    private forumRepository: IForumRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(
    dto: CreateTopicDto,
    userId: string,
    companyId: string
  ): Promise<Result<{ id: string }>> {
    try {
      // Check if category exists and is active
      const categoryResult = await this.forumRepository.findCategoryById(dto.categoryId);
      if (categoryResult.isFailure || !categoryResult.value) {
        return Result.fail('Kategori bulunamadı');
      }

      const category = categoryResult.value;
      if (!category.isActive) {
        return Result.fail('Kategori aktif değil');
      }

      // Generate slug
      const slug = this.generateSlug(dto.title);

      // Check if slug exists
      const existingTopicResult = await this.forumRepository.findTopicBySlug(dto.programId, slug);
      if (existingTopicResult.isSuccess && existingTopicResult.value) {
        return Result.fail('Bu başlıkta bir konu zaten mevcut');
      }

      // Create topic data
      const topicData: Omit<
        ForumTopic,
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'viewCount'
        | 'replyCount'
        | 'likeCount'
        | 'lastReplyAt'
        | 'lastReplyBy'
      > = {
        categoryId: dto.categoryId,
        programId: dto.programId,
        authorId: userId,
        companyId,
        title: dto.title,
        slug,
        content: dto.content,
        status: TopicStatus.OPEN,
        priority: dto.priority || TopicPriority.NORMAL,
        isPinned: false,
        isLocked: false,
        isApproved: !category.requireApproval, // Onay gerekiyorsa false
        solutionReplyId: null,
        solvedAt: null,
        solvedBy: null,
      };

      // Validate
      const errors = ForumTopicEntity.validate(topicData);
      if (errors.length > 0) {
        return Result.fail(errors.join(', '));
      }

      // Create topic
      const result = await this.forumRepository.createTopic(topicData);

      if (result.isFailure) {
        return Result.fail(result.error || 'Konu oluşturulamadı');
      }

      // Add leaderboard score
      if (this.addLeaderboardScore) {
        await this.addLeaderboardScore.execute({
          companyId,
          activityType: ActivityType.FORUM_TOPIC_CREATED,
          activityId: result.value.id,
          metadata: {
            topicTitle: dto.title,
            categoryId: dto.categoryId,
          },
        });
      }

      return Result.ok({ id: result.value.id });
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Konu oluşturulamadı'
      );
    }
  }

  private generateSlug(title: string): string {
    const turkishMap: Record<string, string> = {
      ç: 'c',
      ğ: 'g',
      ı: 'i',
      ö: 'o',
      ş: 's',
      ü: 'u',
      Ç: 'c',
      Ğ: 'g',
      İ: 'i',
      Ö: 'o',
      Ş: 's',
      Ü: 'u',
    };

    return title
      .toLowerCase()
      .split('')
      .map((char) => turkishMap[char] || char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }
}

