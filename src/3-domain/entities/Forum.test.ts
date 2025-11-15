import { describe, it, expect, beforeEach } from 'vitest';
import { ForumTopicEntity } from './Forum';
import { TopicStatus, TopicPriority } from '../enums/ForumEnums';
import type { ForumTopic } from './Forum';

describe('ForumTopicEntity', () => {
  let validTopicData: ForumTopic;

  beforeEach(() => {
    validTopicData = {
      id: 'topic-1',
      categoryId: 'category-1',
      programId: 'program-1',
      authorId: 'author-1',
      companyId: 'company-1',
      title: 'Test Forum Konusu',
      slug: 'test-forum-konusu',
      content: 'Test içerik',
      status: TopicStatus.OPEN,
      priority: TopicPriority.NORMAL,
      isPinned: false,
      isLocked: false,
      isApproved: true,
      solutionReplyId: null,
      solvedAt: null,
      solvedBy: null,
      viewCount: 0,
      replyCount: 0,
      likeCount: 0,
      lastReplyAt: null,
      lastReplyBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('Entity Creation', () => {
    it('should create entity with valid data', () => {
      const entity = new ForumTopicEntity(validTopicData);
      expect(entity.id).toBe('topic-1');
      expect(entity.title).toBe('Test Forum Konusu');
      expect(entity.status).toBe(TopicStatus.OPEN);
      expect(entity.priority).toBe(TopicPriority.NORMAL);
    });
  });

  describe('Status Methods', () => {
    it('isOpen() should return true for open topics', () => {
      const entity = new ForumTopicEntity(validTopicData);
      expect(entity.isOpen()).toBe(true);
    });

    it('isOpen() should return false for locked topics', () => {
      const lockedTopic = { ...validTopicData, isLocked: true };
      const entity = new ForumTopicEntity(lockedTopic);
      expect(entity.isOpen()).toBe(false);
    });

    it('isOpen() should return false for closed topics', () => {
      const closedTopic = { ...validTopicData, status: TopicStatus.CLOSED };
      const entity = new ForumTopicEntity(closedTopic);
      expect(entity.isOpen()).toBe(false);
    });

    it('isSolved() should return true for solved topics', () => {
      const solvedTopic = {
        ...validTopicData,
        status: TopicStatus.SOLVED,
        solutionReplyId: 'reply-1',
      };
      const entity = new ForumTopicEntity(solvedTopic);
      expect(entity.isSolved()).toBe(true);
    });

    it('isSolved() should return false for unsolved topics', () => {
      const entity = new ForumTopicEntity(validTopicData);
      expect(entity.isSolved()).toBe(false);
    });
  });

  describe('Topic Operations', () => {
    it('close() should set status to CLOSED', () => {
      const entity = new ForumTopicEntity(validTopicData);
      const originalUpdatedAt = entity.updatedAt;

      entity.close();

      expect(entity.status).toBe(TopicStatus.CLOSED);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('open() should set status to OPEN', () => {
      const closedTopic = { ...validTopicData, status: TopicStatus.CLOSED };
      const entity = new ForumTopicEntity(closedTopic);
      const originalUpdatedAt = entity.updatedAt;

      entity.open();

      expect(entity.status).toBe(TopicStatus.OPEN);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('lock() should set isLocked to true', () => {
      const entity = new ForumTopicEntity(validTopicData);
      const originalUpdatedAt = entity.updatedAt;

      entity.lock();

      expect(entity.isLocked).toBe(true);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('unlock() should set isLocked to false', () => {
      const lockedTopic = { ...validTopicData, isLocked: true };
      const entity = new ForumTopicEntity(lockedTopic);
      const originalUpdatedAt = entity.updatedAt;

      entity.unlock();

      expect(entity.isLocked).toBe(false);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('pin() should set isPinned to true', () => {
      const entity = new ForumTopicEntity(validTopicData);
      const originalUpdatedAt = entity.updatedAt;

      entity.pin();

      expect(entity.isPinned).toBe(true);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('unpin() should set isPinned to false', () => {
      const pinnedTopic = { ...validTopicData, isPinned: true };
      const entity = new ForumTopicEntity(pinnedTopic);
      const originalUpdatedAt = entity.updatedAt;

      entity.unpin();

      expect(entity.isPinned).toBe(false);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('Solution Methods', () => {
    it('markSolution() should set solution details', () => {
      const entity = new ForumTopicEntity(validTopicData);
      const originalUpdatedAt = entity.updatedAt;
      const userId = 'user-1';
      const replyId = 'reply-1';

      entity.markSolution(replyId, userId);

      expect(entity.solutionReplyId).toBe(replyId);
      expect(entity.solvedBy).toBe(userId);
      expect(entity.status).toBe(TopicStatus.SOLVED);
      expect(entity.solvedAt).toBeInstanceOf(Date);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('unmarkSolution() should clear solution details', () => {
      const solvedTopic = {
        ...validTopicData,
        status: TopicStatus.SOLVED,
        solutionReplyId: 'reply-1',
        solvedAt: new Date(),
        solvedBy: 'user-1',
      };
      const entity = new ForumTopicEntity(solvedTopic);
      const originalUpdatedAt = entity.updatedAt;

      entity.unmarkSolution();

      expect(entity.solutionReplyId).toBeNull();
      expect(entity.solvedBy).toBeNull();
      expect(entity.solvedAt).toBeNull();
      expect(entity.status).toBe(TopicStatus.OPEN);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('canReply() Method', () => {
    it('should return true for open and approved topics', () => {
      const entity = new ForumTopicEntity(validTopicData);
      expect(entity.canReply()).toBe(true);
    });

    it('should return false for locked topics', () => {
      const lockedTopic = { ...validTopicData, isLocked: true };
      const entity = new ForumTopicEntity(lockedTopic);
      expect(entity.canReply()).toBe(false);
    });

    it('should return false for unapproved topics', () => {
      const unapprovedTopic = { ...validTopicData, isApproved: false };
      const entity = new ForumTopicEntity(unapprovedTopic);
      expect(entity.canReply()).toBe(false);
    });

    it('should return false for closed topics', () => {
      const closedTopic = { ...validTopicData, status: TopicStatus.CLOSED };
      const entity = new ForumTopicEntity(closedTopic);
      expect(entity.canReply()).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate topic with all required fields', () => {
      const errors = ForumTopicEntity.validate(validTopicData);
      expect(errors).toHaveLength(0);
    });

    it('should return error for missing title', () => {
      const invalidData = { ...validTopicData, title: '' };
      const errors = ForumTopicEntity.validate(invalidData);
      expect(errors).toContain('Konu başlığı gereklidir');
    });

    it('should return error for title exceeding 500 characters', () => {
      const invalidData = {
        ...validTopicData,
        title: 'a'.repeat(501),
      };
      const errors = ForumTopicEntity.validate(invalidData);
      expect(errors).toContain('Konu başlığı 500 karakterden uzun olamaz');
    });

    it('should return error for missing content', () => {
      const invalidData = { ...validTopicData, content: '' };
      const errors = ForumTopicEntity.validate(invalidData);
      expect(errors).toContain('Konu içeriği gereklidir');
    });

    it('should return error for missing categoryId', () => {
      const invalidData = { ...validTopicData, categoryId: '' };
      const errors = ForumTopicEntity.validate(invalidData);
      expect(errors).toContain('Kategori gereklidir');
    });

    it('should return error for missing programId', () => {
      const invalidData = { ...validTopicData, programId: '' };
      const errors = ForumTopicEntity.validate(invalidData);
      expect(errors).toContain('Program ID gereklidir');
    });

    it('should return error for missing authorId', () => {
      const invalidData = { ...validTopicData, authorId: '' };
      const errors = ForumTopicEntity.validate(invalidData);
      expect(errors).toContain('Yazar ID gereklidir');
    });

    it('should return multiple errors for multiple missing fields', () => {
      const invalidData = {
        ...validTopicData,
        title: '',
        content: '',
        categoryId: '',
      };
      const errors = ForumTopicEntity.validate(invalidData);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors).toContain('Konu başlığı gereklidir');
      expect(errors).toContain('Konu içeriği gereklidir');
      expect(errors).toContain('Kategori gereklidir');
    });
  });
});
