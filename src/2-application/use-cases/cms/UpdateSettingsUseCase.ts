/**
 * Update CMS Settings Use Case
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import { ICMSSettingsRepository } from '@/3-domain/interfaces/repositories/ICMSSettingsRepository';
import { CMSSettings, UpdateCMSSettingsDto } from '@/3-domain/entities/CMSSettings';

export class UpdateSettingsUseCase {
  constructor(private cmsSettingsRepository: ICMSSettingsRepository) {}

  async execute(
    key: string,
    dto: UpdateCMSSettingsDto,
    updatedBy: string
  ): Promise<Result<CMSSettings>> {
    // Check if setting exists
    const existsResult = await this.cmsSettingsRepository.exists(key);
    if (existsResult.isFailure) {
      return Result.fail(
        existsResult.error?.message || existsResult.error || 'Ayar kontrolü başarısız'
      );
    }
    if (!existsResult.value) {
      return Result.fail(`Ayar "${key}" bulunamadı`);
    }

    // Update setting
    const result = await this.cmsSettingsRepository.update(key, dto, updatedBy);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Ayar güncellenemedi');
    }

    return Result.ok(result.value);
  }

  async executeMany(
    settings: Record<string, any>,
    updatedBy: string
  ): Promise<Result<CMSSettings[]>> {
    // Update multiple settings
    const result = await this.cmsSettingsRepository.updateMany(settings, updatedBy);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Ayarlar güncellenemedi');
    }

    return Result.ok(result.value);
  }
}
