import { describe, it, expect } from 'vitest';
import {
  ActivityType,
  BadgeCategory,
  RequirementType,
  BADGE_CATEGORY_LABELS,
  REQUIREMENT_TYPE_LABELS,
} from './LeaderboardEnums';

describe('LeaderboardEnums', () => {
  describe('ActivityType', () => {
    it('should have all required activity types', () => {
      expect(ActivityType.TASK_COMPLETED).toBe('task_completed');
      expect(ActivityType.TASK_COMPLETED_EARLY).toBe('task_completed_early');
      expect(ActivityType.SUBPROJECT_COMPLETED).toBe('subproject_completed');
      expect(ActivityType.VIDEO_WATCHED).toBe('video_watched');
      expect(ActivityType.DOCUMENT_READ).toBe('document_read');
      expect(ActivityType.EVENT_ATTENDED).toBe('event_attended');
      expect(ActivityType.FORUM_TOPIC_CREATED).toBe('forum_topic_created');
      expect(ActivityType.FORUM_REPLY_CREATED).toBe('forum_reply_created');
      expect(ActivityType.NEWS_READ).toBe('news_read');
      expect(ActivityType.BADGE_EARNED).toBe('badge_earned');
    });
  });

  describe('BadgeCategory', () => {
    it('should have all required categories', () => {
      expect(BadgeCategory.PROJECT).toBe('project');
      expect(BadgeCategory.TRAINING).toBe('training');
      expect(BadgeCategory.EVENT).toBe('event');
      expect(BadgeCategory.FORUM).toBe('forum');
      expect(BadgeCategory.NEWS).toBe('news');
      expect(BadgeCategory.GENERAL).toBe('general');
    });

    it('should have labels for all categories', () => {
      expect(BADGE_CATEGORY_LABELS[BadgeCategory.PROJECT]).toBe('Proje');
      expect(BADGE_CATEGORY_LABELS[BadgeCategory.TRAINING]).toBe('Eğitim');
      expect(BADGE_CATEGORY_LABELS[BadgeCategory.EVENT]).toBe('Etkinlik');
      expect(BADGE_CATEGORY_LABELS[BadgeCategory.FORUM]).toBe('Forum');
      expect(BADGE_CATEGORY_LABELS[BadgeCategory.NEWS]).toBe('Haberler');
      expect(BADGE_CATEGORY_LABELS[BadgeCategory.GENERAL]).toBe('Genel');
    });
  });

  describe('RequirementType', () => {
    it('should have all required types', () => {
      expect(RequirementType.COUNT).toBe('count');
      expect(RequirementType.STREAK).toBe('streak');
      expect(RequirementType.MILESTONE).toBe('milestone');
      expect(RequirementType.THRESHOLD).toBe('threshold');
    });

    it('should have labels for all requirement types', () => {
      expect(REQUIREMENT_TYPE_LABELS[RequirementType.COUNT]).toBe('Sayı');
      expect(REQUIREMENT_TYPE_LABELS[RequirementType.STREAK]).toBe('Seri');
      expect(REQUIREMENT_TYPE_LABELS[RequirementType.MILESTONE]).toBe('Kilometre Taşı');
      expect(REQUIREMENT_TYPE_LABELS[RequirementType.THRESHOLD]).toBe('Eşik Değeri');
    });
  });
});
