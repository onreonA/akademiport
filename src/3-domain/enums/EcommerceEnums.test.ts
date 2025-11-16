import { describe, it, expect } from 'vitest';
import {
  EcommercePlatformType,
  EcommercePlatformTypeLabels,
  EcommercePlatformCategory,
  getPlatformCategory,
} from './EcommerceEnums';

describe('EcommerceEnums', () => {
  describe('EcommercePlatformType', () => {
    it('should have all required platform types', () => {
      expect(EcommercePlatformType.ALIBABA).toBe('alibaba');
      expect(EcommercePlatformType.AMAZON).toBe('amazon');
      expect(EcommercePlatformType.ETSY).toBe('etsy');
      expect(EcommercePlatformType.TRENDYOL).toBe('trendyol');
      expect(EcommercePlatformType.HEPSIBURADA).toBe('hepsiburada');
      expect(EcommercePlatformType.N11).toBe('n11');
      expect(EcommercePlatformType.GITTI_GIDIYOR).toBe('gitti-gidiyor');
      expect(EcommercePlatformType.OTHER).toBe('other');
    });

    it('should have correct labels for all platform types', () => {
      expect(EcommercePlatformTypeLabels[EcommercePlatformType.ALIBABA]).toBe('Alibaba');
      expect(EcommercePlatformTypeLabels[EcommercePlatformType.AMAZON]).toBe('Amazon');
      expect(EcommercePlatformTypeLabels[EcommercePlatformType.ETSY]).toBe('Etsy');
      expect(EcommercePlatformTypeLabels[EcommercePlatformType.TRENDYOL]).toBe('Trendyol');
      expect(EcommercePlatformTypeLabels[EcommercePlatformType.HEPSIBURADA]).toBe('Hepsiburada');
      expect(EcommercePlatformTypeLabels[EcommercePlatformType.N11]).toBe('N11');
      expect(EcommercePlatformTypeLabels[EcommercePlatformType.GITTI_GIDIYOR]).toBe(
        'Gitti Gidiyor'
      );
      expect(EcommercePlatformTypeLabels[EcommercePlatformType.OTHER]).toBe('Diğer');
    });

    it('should have labels for all platform types', () => {
      Object.values(EcommercePlatformType).forEach((platform) => {
        expect(EcommercePlatformTypeLabels[platform]).toBeDefined();
        expect(typeof EcommercePlatformTypeLabels[platform]).toBe('string');
        expect(EcommercePlatformTypeLabels[platform].length).toBeGreaterThan(0);
      });
    });
  });

  describe('EcommercePlatformCategory', () => {
    it('should have B2B and B2C categories', () => {
      expect(EcommercePlatformCategory.B2B).toBe('b2b');
      expect(EcommercePlatformCategory.B2C).toBe('b2c');
    });
  });

  describe('getPlatformCategory', () => {
    it('should return B2B for Alibaba', () => {
      expect(getPlatformCategory(EcommercePlatformType.ALIBABA)).toBe(
        EcommercePlatformCategory.B2B
      );
    });

    it('should return B2C for all other platforms', () => {
      expect(getPlatformCategory(EcommercePlatformType.AMAZON)).toBe(EcommercePlatformCategory.B2C);
      expect(getPlatformCategory(EcommercePlatformType.ETSY)).toBe(EcommercePlatformCategory.B2C);
      expect(getPlatformCategory(EcommercePlatformType.TRENDYOL)).toBe(
        EcommercePlatformCategory.B2C
      );
      expect(getPlatformCategory(EcommercePlatformType.HEPSIBURADA)).toBe(
        EcommercePlatformCategory.B2C
      );
      expect(getPlatformCategory(EcommercePlatformType.N11)).toBe(EcommercePlatformCategory.B2C);
      expect(getPlatformCategory(EcommercePlatformType.GITTI_GIDIYOR)).toBe(
        EcommercePlatformCategory.B2C
      );
      expect(getPlatformCategory(EcommercePlatformType.OTHER)).toBe(EcommercePlatformCategory.B2C);
    });
  });
});
