/**
 * Get CMS Page Use Case
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import { ICMSPageRepository } from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { CMSPage } from '@/3-domain/entities/CMSPage';

export class GetPageUseCase {
  constructor(private cmsPageRepository: ICMSPageRepository) {}

  async executeById(id: string): Promise<Result<CMSPage | null>> {
    const result = await this.cmsPageRepository.findById(id);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Sayfa bulunamadı');
    }

    return Result.ok(result.value);
  }

  async executeBySlug(slug: string, includeArchived = false): Promise<Result<CMSPage | null>> {
    const result = await this.cmsPageRepository.findBySlug(slug, includeArchived);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Sayfa bulunamadı');
    }

    return Result.ok(result.value);
  }
}
