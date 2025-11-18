/**
 * CMS Settings Repository Interface
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import {
  CMSSettings,
  CreateCMSSettingsDto,
  UpdateCMSSettingsDto,
  CMSSettingsCategory,
} from '@/3-domain/entities/CMSSettings';

export interface ICMSSettingsRepository {
  /**
   * Create a new setting
   */
  create(dto: CreateCMSSettingsDto, updatedBy: string): Promise<Result<CMSSettings>>;

  /**
   * Update a setting
   */
  update(key: string, dto: UpdateCMSSettingsDto, updatedBy: string): Promise<Result<CMSSettings>>;

  /**
   * Update multiple settings at once
   */
  updateMany(settings: Record<string, any>, updatedBy: string): Promise<Result<CMSSettings[]>>;

  /**
   * Get a setting by key
   */
  get(key: string): Promise<Result<CMSSettings | null>>;

  /**
   * Get all settings
   */
  getAll(): Promise<Result<CMSSettings[]>>;

  /**
   * Get settings by category
   */
  getByCategory(category: CMSSettingsCategory): Promise<Result<CMSSettings[]>>;

  /**
   * Delete a setting
   */
  delete(key: string): Promise<Result<void>>;

  /**
   * Check if setting exists
   */
  exists(key: string): Promise<Result<boolean>>;
}
