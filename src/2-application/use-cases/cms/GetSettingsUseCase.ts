/**
 * Get CMS Settings Use Case
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import { ICMSSettingsRepository } from '@/3-domain/interfaces/repositories/ICMSSettingsRepository';
import { CMSSettings, CMSSettingsCategory } from '@/3-domain/entities/CMSSettings';

export class GetSettingsUseCase {
  constructor(private cmsSettingsRepository: ICMSSettingsRepository) {}

  async executeByKey(key: string): Promise<Result<CMSSettings | null>> {
    const result = await this.cmsSettingsRepository.get(key);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Ayar bulunamadı');
    }

    return Result.ok(result.value);
  }

  async executeAll(): Promise<Result<CMSSettings[]>> {
    const result = await this.cmsSettingsRepository.getAll();

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Ayarlar alınamadı');
    }

    return Result.ok(result.value);
  }

  async executeByCategory(category: CMSSettingsCategory): Promise<Result<CMSSettings[]>> {
    const result = await this.cmsSettingsRepository.getByCategory(category);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Ayarlar alınamadı');
    }

    return Result.ok(result.value);
  }
}
