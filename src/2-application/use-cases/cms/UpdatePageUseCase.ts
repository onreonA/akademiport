/**
 * Update CMS Page Use Case
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import { ICMSPageRepository } from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { CMSPage, UpdateCMSPageDto, CMSPageEntity } from '@/3-domain/entities/CMSPage';

export class UpdatePageUseCase {
  constructor(private cmsPageRepository: ICMSPageRepository) {}

  async execute(id: string, dto: UpdateCMSPageDto): Promise<Result<CMSPage>> {
    // Check if page exists
    const existingPageResult = await this.cmsPageRepository.findById(id);
    if (existingPageResult.isFailure) {
      return Result.fail(
        existingPageResult.error?.message || existingPageResult.error || 'Sayfa bulunamadı'
      );
    }
    if (!existingPageResult.value) {
      return Result.fail('Sayfa bulunamadı');
    }

    // Validate slug format if being updated
    if (dto.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(dto.slug)) {
        return Result.fail(
          'Slug formatı geçersiz. Sadece küçük harf, rakam ve tire kullanılabilir.'
        );
      }

      // Check if slug exists (excluding current page)
      const slugExistsResult = await this.cmsPageRepository.slugExists(dto.slug, id);
      if (slugExistsResult.isFailure) {
        return Result.fail(
          slugExistsResult.error?.message || slugExistsResult.error || 'Slug kontrolü başarısız'
        );
      }
      if (slugExistsResult.value) {
        return Result.fail(`Slug "${dto.slug}" zaten kullanılıyor`);
      }
    }

    // Validate meta title length
    if (dto.metaTitle && dto.metaTitle.length > 60) {
      return Result.fail('Meta title maksimum 60 karakter olabilir');
    }

    // Validate meta description length
    if (dto.metaDescription && dto.metaDescription.length > 160) {
      return Result.fail('Meta description maksimum 160 karakter olabilir');
    }

    // Update page
    const result = await this.cmsPageRepository.update(id, dto);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Sayfa güncellenemedi');
    }

    return Result.ok(result.value);
  }
}
