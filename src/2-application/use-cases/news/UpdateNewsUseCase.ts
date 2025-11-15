import { Result } from '@/6-core/result/Result';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { News, NewsEntity, NewsTag } from '@/3-domain/entities/News';
import { UpdateNewsDto } from '@/2-application/dtos/news/UpdateNewsDto';

export class UpdateNewsUseCase {
  constructor(private newsRepository: INewsRepository) {}

  async execute(newsId: string, dto: UpdateNewsDto, userId: string): Promise<Result<News>> {
    // Get existing news
    const existingResult = await this.newsRepository.findById(newsId);
    if (existingResult.isFailure) {
      return Result.fail(existingResult.error || 'Haber bulunamadı');
    }

    if (!existingResult.value) {
      return Result.fail('Haber bulunamadı');
    }

    const existing = existingResult.value;

    // Prepare update data
    const updateData: Partial<News> = {
      ...dto,
      updatedBy: userId,
    };

    // If content changed, recalculate reading time
    if (dto.content && dto.content !== existing.content) {
      const entity = new NewsEntity({
        ...existing,
        content: dto.content,
      });
      entity.calculateReadingTime();
      updateData.readingTime = entity.readingTime;
    }

    // Validate
    const errors = NewsEntity.validate({ ...existing, ...updateData });
    if (errors.length > 0) {
      return Result.fail(errors.join(', '));
    }

    // Update in database
    const result = await this.newsRepository.update(newsId, updateData);

    if (result.isFailure) {
      return Result.fail(result.error || 'Haber güncellenemedi');
    }

    // Update tags if provided
    if (dto.tags !== undefined) {
      // Get current tags
      const currentTagsResult = await this.newsRepository.getNewsTags(newsId);
      if (currentTagsResult.isSuccess) {
        const currentTagIds = currentTagsResult.value.map((t: NewsTag) => t.id);

        // Remove old tags
        for (const tagId of currentTagIds) {
          if (!dto.tags.includes(tagId)) {
            await this.newsRepository.removeTagFromNews(newsId, tagId);
          }
        }

        // Add new tags
        for (const tagId of dto.tags) {
          if (!currentTagIds.includes(tagId)) {
            await this.newsRepository.addTagToNews(newsId, tagId);
          }
        }
      }
    }

    return Result.ok(result.value);
  }
}
