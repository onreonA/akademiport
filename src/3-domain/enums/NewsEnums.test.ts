import { describe, it, expect } from 'vitest';
import {
  NewsCategory,
  NewsStatus,
  NEWS_CATEGORY_LABELS,
  NEWS_STATUS_LABELS,
  NEWS_STATUS_COLORS,
} from './NewsEnums';

describe('NewsEnums', () => {
  describe('NewsCategory', () => {
    it('should have all required category values', () => {
      expect(NewsCategory.E_COMMERCE).toBe('e_commerce');
      expect(NewsCategory.E_EXPORT).toBe('e_export');
      expect(NewsCategory.TECHNOLOGY).toBe('technology');
      expect(NewsCategory.DIGITAL_MARKETING).toBe('digital_marketing');
      expect(NewsCategory.LOGISTICS).toBe('logistics');
      expect(NewsCategory.FINANCE).toBe('finance');
      expect(NewsCategory.LEGAL).toBe('legal');
      expect(NewsCategory.GENERAL).toBe('general');
    });

    it('should have labels for all categories', () => {
      expect(NEWS_CATEGORY_LABELS[NewsCategory.E_COMMERCE]).toBe('E-ticaret');
      expect(NEWS_CATEGORY_LABELS[NewsCategory.E_EXPORT]).toBe('E-ihracat');
      expect(NEWS_CATEGORY_LABELS[NewsCategory.TECHNOLOGY]).toBe('Teknoloji');
      expect(NEWS_CATEGORY_LABELS[NewsCategory.DIGITAL_MARKETING]).toBe('Dijital Pazarlama');
      expect(NEWS_CATEGORY_LABELS[NewsCategory.LOGISTICS]).toBe('Lojistik');
      expect(NEWS_CATEGORY_LABELS[NewsCategory.FINANCE]).toBe('Finans');
      expect(NEWS_CATEGORY_LABELS[NewsCategory.LEGAL]).toBe('Hukuki');
      expect(NEWS_CATEGORY_LABELS[NewsCategory.GENERAL]).toBe('Genel');
    });

    it('should have all categories in labels mapping', () => {
      const categories = Object.values(NewsCategory);
      categories.forEach((category) => {
        expect(NEWS_CATEGORY_LABELS[category]).toBeDefined();
        expect(typeof NEWS_CATEGORY_LABELS[category]).toBe('string');
      });
    });
  });

  describe('NewsStatus', () => {
    it('should have all required status values', () => {
      expect(NewsStatus.DRAFT).toBe('draft');
      expect(NewsStatus.PUBLISHED).toBe('published');
      expect(NewsStatus.ARCHIVED).toBe('archived');
    });

    it('should have labels for all statuses', () => {
      expect(NEWS_STATUS_LABELS[NewsStatus.DRAFT]).toBe('Taslak');
      expect(NEWS_STATUS_LABELS[NewsStatus.PUBLISHED]).toBe('Yayında');
      expect(NEWS_STATUS_LABELS[NewsStatus.ARCHIVED]).toBe('Arşiv');
    });

    it('should have colors for all statuses', () => {
      expect(NEWS_STATUS_COLORS[NewsStatus.DRAFT]).toBe('gray');
      expect(NEWS_STATUS_COLORS[NewsStatus.PUBLISHED]).toBe('green');
      expect(NEWS_STATUS_COLORS[NewsStatus.ARCHIVED]).toBe('orange');
    });

    it('should have all statuses in labels mapping', () => {
      const statuses = Object.values(NewsStatus);
      statuses.forEach((status) => {
        expect(NEWS_STATUS_LABELS[status]).toBeDefined();
        expect(typeof NEWS_STATUS_LABELS[status]).toBe('string');
      });
    });

    it('should have all statuses in colors mapping', () => {
      const statuses = Object.values(NewsStatus);
      statuses.forEach((status) => {
        expect(NEWS_STATUS_COLORS[status]).toBeDefined();
        expect(typeof NEWS_STATUS_COLORS[status]).toBe('string');
      });
    });
  });
});
