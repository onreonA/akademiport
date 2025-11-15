import { Result } from '@/6-core/result/Result';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { News } from '@/3-domain/entities/News';
import { NewsStatus } from '@/3-domain/enums/NewsEnums';

export class PublishNewsUseCase {
  constructor(private newsRepository: INewsRepository) {}

  async execute(newsId: string, userId: string): Promise<Result<News>> {
    // Get existing news
    const existingResult = await this.newsRepository.findById(newsId);
    if (existingResult.isFailure) {
      return Result.fail(existingResult.error || 'Haber bulunamadı');
    }

    if (!existingResult.value) {
      return Result.fail('Haber bulunamadı');
    }

    const existing = existingResult.value;

    // Check if already published
    if (existing.status === NewsStatus.PUBLISHED) {
      return Result.fail('Haber zaten yayında');
    }

    // Publish
    const result = await this.newsRepository.publish(newsId, userId);

    if (result.isFailure) {
      return Result.fail(result.error || 'Haber yayınlanamadı');
    }

    return Result.ok(result.value);
  }
}
