/**
 * Delete CMS Page Use Case
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import { ICMSPageRepository } from '@/3-domain/interfaces/repositories/ICMSPageRepository';

export class DeletePageUseCase {
  constructor(private cmsPageRepository: ICMSPageRepository) {}

  async execute(id: string): Promise<Result<void>> {
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

    // Delete (archive) page
    const result = await this.cmsPageRepository.delete(id);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Sayfa silinemedi');
    }

    return Result.ok(undefined);
  }
}
