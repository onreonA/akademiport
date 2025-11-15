import { Result } from '@/6-core/result/Result';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { NewsRead } from '@/3-domain/entities/News';
import { RecordReadDto } from '@/2-application/dtos/news/RecordReadDto';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class RecordNewsReadUseCase {
  constructor(
    private newsRepository: INewsRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(dto: RecordReadDto): Promise<Result<NewsRead>> {
    // Validate news exists
    const newsResult = await this.newsRepository.findById(dto.newsId);
    if (newsResult.isFailure) {
      return Result.fail(newsResult.error || 'Haber bulunamadı');
    }

    if (!newsResult.value) {
      return Result.fail('Haber bulunamadı');
    }

    // Check if completed (>80% scroll or >80% reading time)
    const completed = dto.scrollPercentage ? dto.scrollPercentage >= 80 : false;

    // Record read
    const readData = {
      newsId: dto.newsId,
      userId: dto.userId,
      companyId: dto.companyId,
      readDuration: dto.readDuration || null,
      scrollPercentage: dto.scrollPercentage || 0,
      completed,
    };

    const result = await this.newsRepository.recordRead(readData);

    if (result.isFailure) {
      return Result.fail(result.error || 'Okuma kaydı oluşturulamadı');
    }

    // Add leaderboard score
    if (this.addLeaderboardScore) {
      const activityType = completed
        ? ActivityType.NEWS_READ_COMPLETED
        : ActivityType.NEWS_READ;

      await this.addLeaderboardScore.execute({
        companyId: dto.companyId,
        activityType,
        activityId: dto.newsId,
        metadata: {
          newsId: dto.newsId,
          readDuration: dto.readDuration,
          scrollPercentage: dto.scrollPercentage,
          completed,
        },
      });
    }

    return Result.ok(result.value);
  }
}

