import { Result } from '@/6-core/result/Result';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { News, NewsEntity } from '@/3-domain/entities/News';
import { NewsStatus } from '@/3-domain/enums/NewsEnums';
import { CreateNewsDto } from '@/2-application/dtos/news/CreateNewsDto';

export class CreateNewsUseCase {
  constructor(private newsRepository: INewsRepository) {}

  async execute(dto: CreateNewsDto): Promise<Result<News>> {
    // Generate slug from title
    const slug = this.generateSlug(dto.title);

    // Check if slug already exists
    const existingNews = await this.newsRepository.findBySlug(slug);
    if (existingNews.isSuccess && existingNews.value) {
      return Result.fail('Bu başlıkta bir haber zaten mevcut');
    }

    // Create news entity
    const newsData: Omit<News, 'id' | 'createdAt' | 'updatedAt'> = {
      programId: dto.programId,
      authorId: dto.authorId,
      title: dto.title,
      slug,
      summary: dto.summary || null,
      content: dto.content,
      category: dto.category,
      status: NewsStatus.DRAFT,
      imageUrl: dto.imageUrl || null,
      imageAlt: dto.imageAlt || null,
      metaDescription: dto.metaDescription || null,
      metaKeywords: dto.metaKeywords || null,
      isFeatured: dto.isFeatured || false,
      isPinned: dto.isPinned || false,
      readingTime: null,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      publishedAt: null,
      archivedAt: null,
      createdBy: dto.authorId,
      updatedBy: dto.authorId,
    };

    // Validate
    const errors = NewsEntity.validate(newsData);
    if (errors.length > 0) {
      return Result.fail(errors.join(', '));
    }

    // Calculate reading time
    const entity = new NewsEntity(newsData as News);
    entity.calculateReadingTime();

    // Create in database
    const result = await this.newsRepository.create({
      ...newsData,
      readingTime: entity.readingTime,
    });

    if (result.isFailure) {
      return Result.fail(result.error || 'Haber oluşturulamadı');
    }

    // Add tags if provided
    if (dto.tags && dto.tags.length > 0) {
      for (const tagId of dto.tags) {
        await this.newsRepository.addTagToNews(result.value.id, tagId);
      }
    }

    return Result.ok(result.value);
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

