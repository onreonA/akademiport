import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateSettingsUseCase } from './UpdateSettingsUseCase';
import { ICMSSettingsRepository } from '@/3-domain/interfaces/repositories/ICMSSettingsRepository';
import { Result } from '@/6-core/result/Result';
import { CMSSettings, UpdateCMSSettingsDto } from '@/3-domain/entities/CMSSettings';

describe('UpdateSettingsUseCase', () => {
  let mockRepository: ICMSSettingsRepository;
  let useCase: UpdateSettingsUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      get: vi.fn(),
      getAll: vi.fn(),
      getByCategory: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    } as any;

    useCase = new UpdateSettingsUseCase(mockRepository);
  });

  const createMockSetting = (overrides?: Partial<CMSSettings>): CMSSettings => ({
    id: 'setting-1',
    key: 'site_name',
    value: 'Akademi Port',
    category: 'general',
    updatedAt: new Date(),
    ...overrides,
  });

  describe('execute', () => {
    it('should update a setting successfully', async () => {
      const dto: UpdateCMSSettingsDto = {
        value: 'Updated Value',
      };

      const updatedSetting = createMockSetting({ value: 'Updated Value' });

      vi.mocked(mockRepository.exists).mockResolvedValue(Result.ok(true));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedSetting));

      const result = await useCase.execute('site_name', dto, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(updatedSetting);
      expect(mockRepository.exists).toHaveBeenCalledWith('site_name');
      expect(mockRepository.update).toHaveBeenCalledWith('site_name', dto, 'user-1');
    });

    it('should fail if setting not found', async () => {
      const dto: UpdateCMSSettingsDto = {
        value: 'Updated Value',
      };

      vi.mocked(mockRepository.exists).mockResolvedValue(Result.ok(false));

      const result = await useCase.execute('nonexistent', dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('bulunamadı');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should fail if exists check fails', async () => {
      const dto: UpdateCMSSettingsDto = {
        value: 'Updated Value',
      };

      vi.mocked(mockRepository.exists).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('site_name', dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should fail if repository update fails', async () => {
      const dto: UpdateCMSSettingsDto = {
        value: 'Updated Value',
      };

      vi.mocked(mockRepository.exists).mockResolvedValue(Result.ok(true));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('site_name', dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });

    it('should update category if provided', async () => {
      const dto: UpdateCMSSettingsDto = {
        value: 'Updated Value',
        category: 'contact',
      };

      const updatedSetting = createMockSetting({ value: 'Updated Value', category: 'contact' });

      vi.mocked(mockRepository.exists).mockResolvedValue(Result.ok(true));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedSetting));

      const result = await useCase.execute('site_name', dto, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith('site_name', dto, 'user-1');
    });
  });

  describe('executeMany', () => {
    it('should update multiple settings successfully', async () => {
      const settings = {
        site_name: 'Updated Site Name',
        contact_email: 'updated@example.com',
      };

      const updatedSettings = [
        createMockSetting({ key: 'site_name', value: 'Updated Site Name' }),
        createMockSetting({
          key: 'contact_email',
          value: 'updated@example.com',
          category: 'contact',
        }),
      ];

      vi.mocked(mockRepository.updateMany).mockResolvedValue(Result.ok(updatedSettings));

      const result = await useCase.executeMany(settings, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(updatedSettings);
      expect(mockRepository.updateMany).toHaveBeenCalledWith(settings, 'user-1');
    });

    it('should fail if repository updateMany fails', async () => {
      const settings = {
        site_name: 'Updated Site Name',
      };

      vi.mocked(mockRepository.updateMany).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.executeMany(settings, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });

    it('should handle empty settings object', async () => {
      const settings = {};

      vi.mocked(mockRepository.updateMany).mockResolvedValue(Result.ok([]));

      const result = await useCase.executeMany(settings, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });
  });
});
