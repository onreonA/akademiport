/**
 * Create CMS Page Use Case
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import { ICMSPageRepository } from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { CMSPage, CreateCMSPageDto, CMSPageEntity } from '@/3-domain/entities/CMSPage';

export class CreatePageUseCase {
  constructor(private cmsPageRepository: ICMSPageRepository) {}

  async execute(dto: CreateCMSPageDto, createdBy: string): Promise<Result<CMSPage>> {
    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(dto.slug)) {
      return Result.fail('Slug formatı geçersiz. Sadece küçük harf, rakam ve tire kullanılabilir.');
    }

    // Check if slug exists
    const slugExistsResult = await this.cmsPageRepository.slugExists(dto.slug);
    if (slugExistsResult.isFailure) {
      return Result.fail(
        slugExistsResult.error?.message || slugExistsResult.error || 'Slug kontrolü başarısız'
      );
    }
    if (slugExistsResult.value) {
      return Result.fail(`Slug "${dto.slug}" zaten kullanılıyor`);
    }

    // Validate meta title length (max 60 characters recommended)
    if (dto.metaTitle && dto.metaTitle.length > 60) {
      return Result.fail('Meta title maksimum 60 karakter olabilir');
    }

    // Validate meta description length (max 160 characters recommended)
    if (dto.metaDescription && dto.metaDescription.length > 160) {
      return Result.fail('Meta description maksimum 160 karakter olabilir');
    }

    // Create page
    const result = await this.cmsPageRepository.create(
      {
        ...dto,
        status: dto.status || 'draft',
        content: dto.content || [],
      },
      createdBy
    );

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Sayfa oluşturulamadı');
    }

    // Validate entity
    const entity = new CMSPageEntity(result.value);
    if (!entity.validateSlug()) {
      return Result.fail('Slug formatı geçersiz');
    }

    return Result.ok(result.value);
  }
}
