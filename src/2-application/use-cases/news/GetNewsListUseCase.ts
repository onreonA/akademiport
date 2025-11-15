import { Result } from '@/6-core/result/Result';
import { INewsRepository, NewsFilters, NewsWithTags } from '@/3-domain/interfaces/repositories/INewsRepository';

export class GetNewsListUseCase {
  constructor(private newsRepository: INewsRepository) {}

  async execute(filters: NewsFilters): Promise<Result<NewsWithTags[]>> {
    const result = await this.newsRepository.findAll(filters);

    if (result.isFailure) {
      return Result.fail(result.error || 'Haberler getirilemedi');
    }

    return Result.ok(result.value);
  }
}

