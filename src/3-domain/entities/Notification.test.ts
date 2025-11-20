/**
 * Notification Entity Tests
 *
 * Unit tests for Notification entity
 */

import { describe, it, expect } from 'vitest';
import {
  createNotification,
  markNotificationAsRead,
  isNotificationExpired,
  shouldSendEmail,
  shouldSendPush,
} from './Notification';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '../enums/NotificationEnums';

describe('Notification Entity', () => {
  const baseNotificationData = {
    userId: 'user-123',
    type: NotificationType.INFO,
    title: 'Test Notification',
    message: 'This is a test notification',
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP],
    metadata: {},
  };

  describe('createNotification', () => {
    it('should create a notification with default values', () => {
      const notification = createNotification(baseNotificationData);

      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe('user-123');
      expect(notification.type).toBe(NotificationType.INFO);
      expect(notification.title).toBe('Test Notification');
      expect(notification.message).toBe('This is a test notification');
      expect(notification.priority).toBe(NotificationPriority.NORMAL);
      expect(notification.channels).toEqual([NotificationChannel.IN_APP]);
      expect(notification.isRead).toBe(false);
      expect(notification.emailSent).toBe(false);
      expect(notification.pushSent).toBe(false);
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it('should create a notification with optional fields', () => {
      const notification = createNotification({
        ...baseNotificationData,
        actionUrl: 'https://example.com',
        metadata: { taskId: 'task-123' },
        expiresAt: new Date('2025-12-31'),
      });

      expect(notification.actionUrl).toBe('https://example.com');
      expect(notification.metadata).toEqual({ taskId: 'task-123' });
      expect(notification.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', () => {
      const notification = createNotification(baseNotificationData);
      const readNotification = markNotificationAsRead(notification);

      expect(readNotification.isRead).toBe(true);
      expect(readNotification.readAt).toBeInstanceOf(Date);
      expect(readNotification.id).toBe(notification.id);
    });
  });

  describe('isNotificationExpired', () => {
    it('should return false if notification has no expiration', () => {
      const notification = createNotification(baseNotificationData);
      expect(isNotificationExpired(notification)).toBe(false);
    });

    it('should return false if notification is not expired', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const notification = createNotification({
        ...baseNotificationData,
        expiresAt: futureDate,
      });
      expect(isNotificationExpired(notification)).toBe(false);
    });

    it('should return true if notification is expired', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const notification = createNotification({
        ...baseNotificationData,
        expiresAt: pastDate,
      });
      expect(isNotificationExpired(notification)).toBe(true);
    });
  });

  describe('shouldSendEmail', () => {
    it('should return true if EMAIL channel is included', () => {
      const notification = createNotification({
        ...baseNotificationData,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      });
      expect(shouldSendEmail(notification)).toBe(true);
    });

    it('should return false if EMAIL channel is not included', () => {
      const notification = createNotification({
        ...baseNotificationData,
        channels: [NotificationChannel.IN_APP],
      });
      expect(shouldSendEmail(notification)).toBe(false);
    });
  });

  describe('shouldSendPush', () => {
    it('should return true if PUSH channel is included', () => {
      const notification = createNotification({
        ...baseNotificationData,
        channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      });
      expect(shouldSendPush(notification)).toBe(true);
    });

    it('should return false if PUSH channel is not included', () => {
      const notification = createNotification({
        ...baseNotificationData,
        channels: [NotificationChannel.IN_APP],
      });
      expect(shouldSendPush(notification)).toBe(false);
    });
  });
});
