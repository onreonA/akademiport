/**
 * Notification Enums Tests
 *
 * Unit tests for notification-related enums
 */

import { describe, it, expect } from 'vitest';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  getNotificationPriorityLabel,
  getNotificationChannelLabel,
  getNotificationTypeLabel,
} from './NotificationEnums';

describe('NotificationEnums', () => {
  describe('NotificationPriority', () => {
    it('should have correct priority values', () => {
      expect(NotificationPriority.LOW).toBe('low');
      expect(NotificationPriority.NORMAL).toBe('normal');
      expect(NotificationPriority.HIGH).toBe('high');
      expect(NotificationPriority.URGENT).toBe('urgent');
    });

    it('getNotificationPriorityLabel should return correct labels', () => {
      expect(getNotificationPriorityLabel(NotificationPriority.LOW)).toBe('Düşük');
      expect(getNotificationPriorityLabel(NotificationPriority.NORMAL)).toBe('Normal');
      expect(getNotificationPriorityLabel(NotificationPriority.HIGH)).toBe('Yüksek');
      expect(getNotificationPriorityLabel(NotificationPriority.URGENT)).toBe('Acil');
    });
  });

  describe('NotificationChannel', () => {
    it('should have correct channel values', () => {
      expect(NotificationChannel.IN_APP).toBe('in_app');
      expect(NotificationChannel.EMAIL).toBe('email');
      expect(NotificationChannel.PUSH).toBe('push');
      expect(NotificationChannel.SMS).toBe('sms');
    });

    it('getNotificationChannelLabel should return correct labels', () => {
      expect(getNotificationChannelLabel(NotificationChannel.IN_APP)).toBe('Uygulama İçi');
      expect(getNotificationChannelLabel(NotificationChannel.EMAIL)).toBe('E-posta');
      expect(getNotificationChannelLabel(NotificationChannel.PUSH)).toBe('Push Bildirimi');
      expect(getNotificationChannelLabel(NotificationChannel.SMS)).toBe('SMS');
    });
  });

  describe('NotificationType', () => {
    it('should have correct type values', () => {
      expect(NotificationType.INFO).toBe('info');
      expect(NotificationType.SUCCESS).toBe('success');
      expect(NotificationType.WARNING).toBe('warning');
      expect(NotificationType.ERROR).toBe('error');
      expect(NotificationType.TASK_ASSIGNED).toBe('task_assigned');
      expect(NotificationType.TASK_COMPLETED).toBe('task_completed');
      expect(NotificationType.EVENT_REMINDER).toBe('event_reminder');
      expect(NotificationType.APPOINTMENT_CONFIRMED).toBe('appointment_confirmed');
      expect(NotificationType.BADGE_EARNED).toBe('badge_earned');
      expect(NotificationType.ECOMMERCE_METRICS_REMINDER).toBe('ecommerce_metrics_reminder');
    });

    it('getNotificationTypeLabel should return correct labels', () => {
      expect(getNotificationTypeLabel(NotificationType.INFO)).toBe('Bilgilendirme');
      expect(getNotificationTypeLabel(NotificationType.SUCCESS)).toBe('Başarı');
      expect(getNotificationTypeLabel(NotificationType.WARNING)).toBe('Uyarı');
      expect(getNotificationTypeLabel(NotificationType.ERROR)).toBe('Hata');
      expect(getNotificationTypeLabel(NotificationType.TASK_ASSIGNED)).toBe('Görev Atandı');
      expect(getNotificationTypeLabel(NotificationType.TASK_COMPLETED)).toBe('Görev Tamamlandı');
      expect(getNotificationTypeLabel(NotificationType.EVENT_REMINDER)).toBe(
        'Etkinlik Hatırlatması'
      );
      expect(getNotificationTypeLabel(NotificationType.APPOINTMENT_CONFIRMED)).toBe(
        'Randevu Onaylandı'
      );
      expect(getNotificationTypeLabel(NotificationType.BADGE_EARNED)).toBe('Rozet Kazanıldı');
      expect(getNotificationTypeLabel(NotificationType.ECOMMERCE_METRICS_REMINDER)).toBe(
        'E-Ticaret Metrikleri Hatırlatması'
      );
    });

    it('getNotificationTypeLabel should return type if label not found', () => {
      const unknownType = 'unknown_type' as NotificationType;
      expect(getNotificationTypeLabel(unknownType)).toBe('unknown_type');
    });
  });
});
