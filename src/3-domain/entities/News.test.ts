import { describe, it, expect, beforeEach } from 'vitest';
import { NewsEntity } from './News';
import { NewsCategory, NewsStatus } from '../enums/NewsEnums';
import type { News } from './News';

describe('NewsEntity', () => {
  let validNewsData: News;

  beforeEach(() => {
    validNewsData = {
      id: 'test-id',
      programId: 'program-1',
      authorId: 'author-1',
      title: 'Test Haber Başlığı',
      slug: 'test-haber-basligi',
      summary: 'Test özet',
      content: 'Test içerik',
      category: NewsCategory.GENERAL,
      status: NewsStatus.DRAFT,
      imageUrl: null,
      imageAlt: null,
      metaDescription: null,
      metaKeywords: null,
      isFeatured: false,
      isPinned: false,
      readingTime: null,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      publishedAt: null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'author-1',
      updatedBy: 'author-1',
    };
  });

  describe('Entity Creation', () => {
    it('should create entity with valid data', () => {
      const entity = new NewsEntity(validNewsData);
      expect(entity.id).toBe('test-id');
      expect(entity.title).toBe('Test Haber Başlığı');
      expect(entity.status).toBe(NewsStatus.DRAFT);
    });
  });

  describe('Status Methods', () => {
    it('isPublished() should return true for published news', () => {
      const publishedNews = {
        ...validNewsData,
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(),
      };
      const entity = new NewsEntity(publishedNews);
      expect(entity.isPublished()).toBe(true);
    });

    it('isPublished() should return false for draft news', () => {
      const entity = new NewsEntity(validNewsData);
      expect(entity.isPublished()).toBe(false);
    });

    it('isDraft() should return true for draft news', () => {
      const entity = new NewsEntity(validNewsData);
      expect(entity.isDraft()).toBe(true);
    });

    it('isDraft() should return false for published news', () => {
      const publishedNews = {
        ...validNewsData,
        status: NewsStatus.PUBLISHED,
      };
      const entity = new NewsEntity(publishedNews);
      expect(entity.isDraft()).toBe(false);
    });

    it('isArchived() should return true for archived news', () => {
      const archivedNews = {
        ...validNewsData,
        status: NewsStatus.ARCHIVED,
      };
      const entity = new NewsEntity(archivedNews);
      expect(entity.isArchived()).toBe(true);
    });

    it('isArchived() should return false for non-archived news', () => {
      const entity = new NewsEntity(validNewsData);
      expect(entity.isArchived()).toBe(false);
    });
  });

  describe('Publish Methods', () => {
    it('publish() should set status to published and set publishedAt', () => {
      const entity = new NewsEntity(validNewsData);
      const beforePublish = entity.publishedAt;

      entity.publish();

      expect(entity.status).toBe(NewsStatus.PUBLISHED);
      expect(entity.publishedAt).not.toBeNull();
      expect(entity.publishedAt).not.toBe(beforePublish);
    });

    it('publish() should throw error if already published', () => {
      const publishedNews = {
        ...validNewsData,
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(),
      };
      const entity = new NewsEntity(publishedNews);

      expect(() => entity.publish()).toThrow('Haber zaten yayında');
    });

    it('archive() should set status to archived and set archivedAt', () => {
      const entity = new NewsEntity(validNewsData);
      const beforeArchive = entity.archivedAt;

      entity.archive();

      expect(entity.status).toBe(NewsStatus.ARCHIVED);
      expect(entity.archivedAt).not.toBeNull();
      expect(entity.archivedAt).not.toBe(beforeArchive);
    });

    it('unpublish() should set status to draft and clear publishedAt', () => {
      const publishedNews = {
        ...validNewsData,
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(),
      };
      const entity = new NewsEntity(publishedNews);

      entity.unpublish();

      expect(entity.status).toBe(NewsStatus.DRAFT);
      expect(entity.publishedAt).toBeNull();
    });
  });

  describe('Feature Methods', () => {
    it('feature() should set isFeatured to true', () => {
      const entity = new NewsEntity(validNewsData);
      expect(entity.isFeatured).toBe(false);

      entity.feature();

      expect(entity.isFeatured).toBe(true);
    });

    it('unfeature() should set isFeatured to false', () => {
      const featuredNews = {
        ...validNewsData,
        isFeatured: true,
      };
      const entity = new NewsEntity(featuredNews);

      entity.unfeature();

      expect(entity.isFeatured).toBe(false);
    });

    it('pin() should set isPinned to true', () => {
      const entity = new NewsEntity(validNewsData);
      expect(entity.isPinned).toBe(false);

      entity.pin();

      expect(entity.isPinned).toBe(true);
    });

    it('unpin() should set isPinned to false', () => {
      const pinnedNews = {
        ...validNewsData,
        isPinned: true,
      };
      const entity = new NewsEntity(pinnedNews);

      entity.unpin();

      expect(entity.isPinned).toBe(false);
    });
  });

  describe('Reading Time Calculation', () => {
    it('calculateReadingTime() should calculate reading time correctly', () => {
      const longContentNews = {
        ...validNewsData,
        content: 'word '.repeat(400), // 400 words = ~2 minutes at 200 WPM
      };
      const entity = new NewsEntity(longContentNews);

      entity.calculateReadingTime();

      expect(entity.readingTime).toBeGreaterThan(0);
      expect(entity.readingTime).toBeLessThanOrEqual(3); // ~2 minutes
    });

    it('calculateReadingTime() should handle HTML tags correctly', () => {
      const htmlContentNews = {
        ...validNewsData,
        content: '<p>word</p> '.repeat(400), // HTML tags should be ignored
      };
      const entity = new NewsEntity(htmlContentNews);

      entity.calculateReadingTime();

      expect(entity.readingTime).toBeGreaterThan(0);
    });

    it('calculateReadingTime() should handle empty content', () => {
      const emptyContentNews = {
        ...validNewsData,
        content: '',
      };
      const entity = new NewsEntity(emptyContentNews);

      entity.calculateReadingTime();

      expect(entity.readingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validation', () => {
    it('validate() should return empty array for valid data', () => {
      const errors = NewsEntity.validate(validNewsData);
      expect(errors).toHaveLength(0);
    });

    it('validate() should return error for empty title', () => {
      const invalidData = {
        ...validNewsData,
        title: '',
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors).toContain('Haber başlığı gereklidir');
    });

    it('validate() should return error for title longer than 500 chars', () => {
      const invalidData = {
        ...validNewsData,
        title: 'a'.repeat(501),
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors).toContain('Haber başlığı 500 karakterden uzun olamaz');
    });

    it('validate() should return error for empty content', () => {
      const invalidData = {
        ...validNewsData,
        content: '',
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors).toContain('Haber içeriği gereklidir');
    });

    it('validate() should return error for missing programId', () => {
      const invalidData = {
        ...validNewsData,
        programId: '',
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors).toContain('Program ID gereklidir');
    });

    it('validate() should return error for missing authorId', () => {
      const invalidData = {
        ...validNewsData,
        authorId: '',
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors).toContain('Yazar ID gereklidir');
    });

    it('validate() should return error for missing category', () => {
      const invalidData = {
        ...validNewsData,
        category: undefined as any,
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors).toContain('Kategori gereklidir');
    });

    it('validate() should return error for summary longer than 500 chars', () => {
      const invalidData = {
        ...validNewsData,
        summary: 'a'.repeat(501),
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors).toContain('Özet 500 karakterden uzun olamaz');
    });

    it('validate() should return error for metaDescription longer than 160 chars', () => {
      const invalidData = {
        ...validNewsData,
        metaDescription: 'a'.repeat(161),
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors).toContain('Meta açıklama 160 karakterden uzun olamaz');
    });

    it('validate() should return multiple errors for multiple invalid fields', () => {
      const invalidData = {
        ...validNewsData,
        title: '',
        content: '',
        programId: '',
      };
      const errors = NewsEntity.validate(invalidData);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors).toContain('Haber başlığı gereklidir');
      expect(errors).toContain('Haber içeriği gereklidir');
      expect(errors).toContain('Program ID gereklidir');
    });
  });
});
