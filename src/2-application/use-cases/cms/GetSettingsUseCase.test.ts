import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetSettingsUseCase } from './GetSettingsUseCase';
import { ICMSSettingsRepository } from '@/3-domain/interfaces/repositories/ICMSSettingsRepository';
import { Result } from '@/6-core/result/Result';
import { CMSSettings, CMSSettingsCategory } from '@/3-domain/entities/CMSSettings';

describe('GetSettingsUseCase', () => {
  let mockRepository: ICMSSettingsRepository;
  let useCase: GetSettingsUseCase;

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

    useCase = new GetSettingsUseCase(mockRepository);
  });

  const createMockSetting = (overrides?: Partial<CMSSettings>): CMSSettings => ({
    id: 'setting-1',
    key: 'site_name',
    value: 'Akademi Port',
    category: 'general',
    updatedAt: new Date(),
    ...overrides,
  });

  describe('executeByKey', () => {
    it('should get a setting by key successfully', async () => {
      const mockSetting = createMockSetting();

      vi.mocked(mockRepository.get).mockResolvedValue(Result.ok(mockSetting));

      const result = await useCase.executeByKey('site_name');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockSetting);
      expect(mockRepository.get).toHaveBeenCalledWith('site_name');
    });

    it('should return null if setting not found', async () => {
      vi.mocked(mockRepository.get).mockResolvedValue(Result.ok(null));

      const result = await useCase.executeByKey('nonexistent');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should fail if repository get fails', async () => {
      vi.mocked(mockRepository.get).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.executeByKey('site_name');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });
  });

  describe('executeAll', () => {
    it('should get all settings successfully', async () => {
      const mockSettings = [
        createMockSetting({ key: 'site_name' }),
        createMockSetting({ key: 'contact_email', category: 'contact' }),
      ];

      vi.mocked(mockRepository.getAll).mockResolvedValue(Result.ok(mockSettings));

      const result = await useCase.executeAll();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockSettings);
      expect(mockRepository.getAll).toHaveBeenCalled();
    });

    it('should return empty array if no settings found', async () => {
      vi.mocked(mockRepository.getAll).mockResolvedValue(Result.ok([]));

      const result = await useCase.executeAll();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should fail if repository getAll fails', async () => {
      vi.mocked(mockRepository.getAll).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.executeAll();

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });
  });

  describe('executeByCategory', () => {
    it('should get settings by category successfully', async () => {
      const category: CMSSettingsCategory = 'contact';
      const mockSettings = [
        createMockSetting({ key: 'contact_email', category: 'contact' }),
        createMockSetting({ key: 'contact_phone', category: 'contact' }),
      ];

      vi.mocked(mockRepository.getByCategory).mockResolvedValue(Result.ok(mockSettings));

      const result = await useCase.executeByCategory(category);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockSettings);
      expect(mockRepository.getByCategory).toHaveBeenCalledWith(category);
    });

    it('should return empty array if no settings found for category', async () => {
      const category: CMSSettingsCategory = 'analytics';

      vi.mocked(mockRepository.getByCategory).mockResolvedValue(Result.ok([]));

      const result = await useCase.executeByCategory(category);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should fail if repository getByCategory fails', async () => {
      const category: CMSSettingsCategory = 'general';

      vi.mocked(mockRepository.getByCategory).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.executeByCategory(category);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
