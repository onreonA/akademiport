/**
 * Get CMS Pages Use Case
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import {
  ICMSPageRepository,
  CMSPageFilter,
} from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { CMSPage } from '@/3-domain/entities/CMSPage';

export class GetPagesUseCase {
  constructor(private cmsPageRepository: ICMSPageRepository) {}

  async execute(filter?: CMSPageFilter): Promise<Result<CMSPage[]>> {
    const result = await this.cmsPageRepository.findMany(filter);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Sayfalar bulunamadı');
    }

    return Result.ok(result.value);
  }
}
