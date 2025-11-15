/**
 * Integration Tests for SupabaseNewsRepository
 *
 * Tests repository with real Supabase connection
 * Requires: Supabase connection configured in .env.local
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SupabaseNewsRepository } from './SupabaseNewsRepository';
import { NewsCategory, NewsStatus } from '@/3-domain/enums/NewsEnums';
import { Result } from '@/6-core/result/Result';
import {
  createTestProgram,
  createTestUser,
  createTestCompany,
  createTestNews,
  cleanupTestData,
} from '@/5-shared/test/repository-helpers';
import type { News } from '@/3-domain/entities/News';

describe('SupabaseNewsRepository Integration Tests', () => {
  let repository: SupabaseNewsRepository;
  let testProgramId: string;
  let testAuthorId: string;
  let testCompanyId: string;
  let testNewsIds: string[] = [];

  beforeEach(async () => {
    repository = new SupabaseNewsRepository();

    // Create test data
    const program = await createTestProgram(`Test Program ${Date.now()}`);
    testProgramId = program.id;

    const author = await createTestUser(`author-${Date.now()}@test.com`, 'consultant');
    testAuthorId = author.id;

    const company = await createTestCompany(testProgramId, `Test Company ${Date.now()}`);
    testCompanyId = company.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData({
      newsIds: testNewsIds,
      companyIds: [testCompanyId],
      userIds: [testAuthorId],
      programIds: [testProgramId],
    });
    testNewsIds = [];
  });

  describe('create', () => {
    it('should create news successfully', async () => {
      const newsData: Omit<News, 'id' | 'createdAt' | 'updatedAt'> = {
        programId: testProgramId,
        authorId: testAuthorId,
        title: 'Test News Title',
        slug: `test-news-${Date.now()}`,
        summary: 'Test summary',
        content: 'Test content',
        category: NewsCategory.GENERAL,
        status: NewsStatus.DRAFT,
        imageUrl: null,
        imageAlt: null,
        metaDescription: null,
        metaKeywords: null,
        isFeatured: false,
        isPinned: false,
        readingTime: 1,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        publishedAt: null,
        archivedAt: null,
        createdBy: testAuthorId,
        updatedBy: testAuthorId,
      };

      const result = await repository.create(newsData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value.title).toBe('Test News Title');
      expect(result.value.status).toBe(NewsStatus.DRAFT);

      if (result.isSuccess) {
        testNewsIds.push(result.value.id);
      }
    });

    it('should fail with invalid data', async () => {
      // Test with null title (violates NOT NULL constraint)
      const invalidNewsData = {
        programId: testProgramId,
        authorId: testAuthorId,
        title: null, // Null title violates NOT NULL constraint
        slug: `test-news-${Date.now()}`,
        content: 'Test content',
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
        createdBy: testAuthorId,
        updatedBy: testAuthorId,
      } as any;

      const result = await repository.create(invalidNewsData);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('findById', () => {
    it('should find news by id', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const result = await repository.findById(testNews.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.id).toBe(testNews.id);
      expect(result.value?.title).toBe(testNews.title);
    });

    it('should return null for non-existent news', async () => {
      const result = await repository.findById('00000000-0000-0000-0000-000000000000');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find news by slug', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId, {
        slug: `test-slug-${Date.now()}`,
      });
      testNewsIds.push(testNews.id);

      const result = await repository.findBySlug(testNews.slug);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.slug).toBe(testNews.slug);
    });

    it('should return null for non-existent slug', async () => {
      const result = await repository.findBySlug('non-existent-slug');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all news', async () => {
      const news1 = await createTestNews(testProgramId, testAuthorId);
      const news2 = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(news1.id, news2.id);

      const result = await repository.findAll({ programId: testProgramId });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by category', async () => {
      const news1 = await createTestNews(testProgramId, testAuthorId, {
        category: NewsCategory.E_COMMERCE,
      });
      const news2 = await createTestNews(testProgramId, testAuthorId, {
        category: NewsCategory.TECHNOLOGY,
      });
      testNewsIds.push(news1.id, news2.id);

      const result = await repository.findAll({
        programId: testProgramId,
        category: NewsCategory.E_COMMERCE,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value.every((n) => n.category === NewsCategory.E_COMMERCE)).toBe(true);
    });

    it('should filter by status', async () => {
      const news1 = await createTestNews(testProgramId, testAuthorId, {
        status: NewsStatus.PUBLISHED,
      });
      const news2 = await createTestNews(testProgramId, testAuthorId, {
        status: NewsStatus.DRAFT,
      });
      testNewsIds.push(news1.id, news2.id);

      const result = await repository.findAll({
        programId: testProgramId,
        status: NewsStatus.PUBLISHED,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value.every((n) => n.status === NewsStatus.PUBLISHED)).toBe(true);
    });

    it('should support pagination', async () => {
      // Create multiple news
      for (let i = 0; i < 5; i++) {
        const news = await createTestNews(testProgramId, testAuthorId);
        testNewsIds.push(news.id);
      }

      const result = await repository.findAll({
        programId: testProgramId,
        limit: 2,
        offset: 0,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value.length).toBeLessThanOrEqual(2);
    });
  });

  describe('update', () => {
    it('should update news successfully', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const updateData: Partial<News> = {
        title: 'Updated Title',
        summary: 'Updated summary',
        updatedBy: testAuthorId,
      };

      const result = await repository.update(testNews.id, updateData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value.title).toBe('Updated Title');
      expect(result.value.summary).toBe('Updated summary');
    });
  });

  describe('delete', () => {
    it('should delete news successfully', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      const newsId = testNews.id;

      const result = await repository.delete(newsId);

      expect(result.isSuccess).toBe(true);

      // Verify deletion
      const findResult = await repository.findById(newsId);
      expect(findResult.isSuccess).toBe(true);
      expect(findResult.value).toBeNull();
    });
  });

  describe('publish', () => {
    it('should publish draft news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId, {
        status: NewsStatus.DRAFT,
      });
      testNewsIds.push(testNews.id);

      const result = await repository.publish(testNews.id, testAuthorId);

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe(NewsStatus.PUBLISHED);
      expect(result.value.publishedAt).not.toBeNull();
    });
  });

  describe('archive', () => {
    it('should archive published news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId, {
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(),
      });
      testNewsIds.push(testNews.id);

      const result = await repository.archive(testNews.id, testAuthorId);

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe(NewsStatus.ARCHIVED);
      expect(result.value.archivedAt).not.toBeNull();
    });
  });

  describe('feature operations', () => {
    it('should feature news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const result = await repository.feature(testNews.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isFeatured).toBe(true);
    });

    it('should unfeature news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId, {
        isFeatured: true,
      });
      testNewsIds.push(testNews.id);

      const result = await repository.unfeature(testNews.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isFeatured).toBe(false);
    });

    it('should pin news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const result = await repository.pin(testNews.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isPinned).toBe(true);
    });

    it('should unpin news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId, {
        isPinned: true,
      });
      testNewsIds.push(testNews.id);

      const result = await repository.unpin(testNews.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isPinned).toBe(false);
    });
  });

  describe('tag operations', () => {
    it('should get all tags', async () => {
      const result = await repository.getTags();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(Array.isArray(result.value)).toBe(true);
    });

    it('should create tag', async () => {
      const tagName = `test-tag-${Date.now()}`;
      const tagSlug = tagName.replace(/\s+/g, '-').toLowerCase();

      const result = await repository.createTag(tagName, tagSlug);

      expect(result.isSuccess).toBe(true);
      expect(result.value.name).toBe(tagName);
      expect(result.value.slug).toBe(tagSlug);
    });

    it('should add tag to news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      // Create tag
      const tagResult = await repository.createTag(`test-tag-${Date.now()}`, `test-tag-${Date.now()}`);
      expect(tagResult.isSuccess).toBe(true);

      if (tagResult.isSuccess) {
        const result = await repository.addTagToNews(testNews.id, tagResult.value.id);

        expect(result.isSuccess).toBe(true);

        // Verify tag was added
        const tagsResult = await repository.getNewsTags(testNews.id);
        expect(tagsResult.isSuccess).toBe(true);
        if (tagsResult.isSuccess) {
          expect(tagsResult.value.some((t) => t.id === tagResult.value.id)).toBe(true);
        }
      }
    });

    it('should remove tag from news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      // Create and add tag
      const tagResult = await repository.createTag(`test-tag-${Date.now()}`, `test-tag-${Date.now()}`);
      expect(tagResult.isSuccess).toBe(true);

      if (tagResult.isSuccess) {
        const addResult = await repository.addTagToNews(testNews.id, tagResult.value.id);
        expect(addResult.isSuccess).toBe(true);

        // Remove tag
        const result = await repository.removeTagFromNews(testNews.id, tagResult.value.id);

        expect(result.isSuccess).toBe(true);

        // Verify tag was removed
        const tagsResult = await repository.getNewsTags(testNews.id);
        expect(tagsResult.isSuccess).toBe(true);
        if (tagsResult.isSuccess) {
          expect(tagsResult.value.some((t) => t.id === tagResult.value.id)).toBe(false);
        }
      }
    });
  });

  describe('like operations', () => {
    it('should like news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const result = await repository.likeNews(testNews.id, testAuthorId, testCompanyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.newsId).toBe(testNews.id);
        expect(result.value.userId).toBe(testAuthorId);
      }
    });

    it('should check if news is liked by user', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      await repository.likeNews(testNews.id, testAuthorId, testCompanyId);

      const result = await repository.isLikedByUser(testNews.id, testAuthorId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(true);
      }
    });

    it('should unlike news', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const likeResult = await repository.likeNews(testNews.id, testAuthorId, testCompanyId);
      expect(likeResult.isSuccess).toBe(true);

      const result = await repository.unlikeNews(testNews.id, testAuthorId);

      expect(result.isSuccess).toBe(true);

      // Verify unlike
      const isLikedResult = await repository.isLikedByUser(testNews.id, testAuthorId);
      expect(isLikedResult.isSuccess).toBe(true);
      if (isLikedResult.isSuccess) {
        expect(isLikedResult.value).toBe(false);
      }
    });
  });

  describe('read operations', () => {
    it('should record read', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const result = await repository.recordRead({
        newsId: testNews.id,
        userId: testAuthorId,
        companyId: testCompanyId,
        readDuration: 120,
        scrollPercentage: 50,
        completed: false,
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.newsId).toBe(testNews.id);
        expect(result.value.userId).toBe(testAuthorId);
      }
    });

    it('should set completed to true when scrollPercentage >= 80', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const result = await repository.recordRead({
        newsId: testNews.id,
        userId: testAuthorId,
        companyId: testCompanyId,
        readDuration: 120,
        scrollPercentage: 85,
        completed: true,
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.completed).toBe(true);
      }
    });

    it('should get user reads', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const recordResult = await repository.recordRead({
        newsId: testNews.id,
        userId: testAuthorId,
        companyId: testCompanyId,
        readDuration: 120,
        scrollPercentage: 50,
        completed: false,
      });
      expect(recordResult.isSuccess).toBe(true);

      const result = await repository.getUserReads(testAuthorId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    it('should get news reads', async () => {
      const testNews = await createTestNews(testProgramId, testAuthorId);
      testNewsIds.push(testNews.id);

      const recordResult = await repository.recordRead({
        newsId: testNews.id,
        userId: testAuthorId,
        companyId: testCompanyId,
        readDuration: 120,
        scrollPercentage: 50,
        completed: false,
      });
      expect(recordResult.isSuccess).toBe(true);

      const result = await repository.getNewsReads(testNews.id);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('statistics', () => {
    it('should get statistics', async () => {
      const news1 = await createTestNews(testProgramId, testAuthorId, {
        status: NewsStatus.PUBLISHED,
      });
      const news2 = await createTestNews(testProgramId, testAuthorId, {
        status: NewsStatus.DRAFT,
      });
      testNewsIds.push(news1.id, news2.id);

      const result = await repository.getStatistics(testProgramId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalNews).toBeGreaterThanOrEqual(2);
        expect(result.value.publishedNews).toBeGreaterThanOrEqual(1);
        expect(result.value.draftNews).toBeGreaterThanOrEqual(1);
      }
    });
  });
});

