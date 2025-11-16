import { describe, it, expect } from 'vitest';
import {
  EmailType,
  EmailStatus,
  EmailPriority,
  EmailTypeLabels,
  EmailStatusLabels,
  EmailPriorityLabels,
} from './EmailEnums';

describe('EmailEnums', () => {
  describe('EmailType', () => {
    it('should have all required email types', () => {
      expect(EmailType.TRANSACTIONAL).toBe('transactional');
      expect(EmailType.MARKETING).toBe('marketing');
      expect(EmailType.NOTIFICATION).toBe('notification');
    });

    it('should have labels for all email types', () => {
      expect(EmailTypeLabels[EmailType.TRANSACTIONAL]).toBe('İşlemsel');
      expect(EmailTypeLabels[EmailType.MARKETING]).toBe('Pazarlama');
      expect(EmailTypeLabels[EmailType.NOTIFICATION]).toBe('Bildirim');
    });
  });

  describe('EmailStatus', () => {
    it('should have all required status types', () => {
      expect(EmailStatus.PENDING).toBe('pending');
      expect(EmailStatus.QUEUED).toBe('queued');
      expect(EmailStatus.SENDING).toBe('sending');
      expect(EmailStatus.SENT).toBe('sent');
      expect(EmailStatus.FAILED).toBe('failed');
      expect(EmailStatus.BOUNCED).toBe('bounced');
      expect(EmailStatus.SPAM_REPORTED).toBe('spam_reported');
      expect(EmailStatus.UNSUBSCRIBED).toBe('unsubscribed');
    });

    it('should have labels for all status types', () => {
      Object.values(EmailStatus).forEach((status) => {
        expect(EmailStatusLabels[status]).toBeDefined();
        expect(typeof EmailStatusLabels[status]).toBe('string');
        expect(EmailStatusLabels[status].length).toBeGreaterThan(0);
      });
    });
  });

  describe('EmailPriority', () => {
    it('should have all required priority types', () => {
      expect(EmailPriority.LOW).toBe('low');
      expect(EmailPriority.NORMAL).toBe('normal');
      expect(EmailPriority.HIGH).toBe('high');
      expect(EmailPriority.URGENT).toBe('urgent');
    });

    it('should have labels for all priority types', () => {
      expect(EmailPriorityLabels[EmailPriority.LOW]).toBe('Düşük');
      expect(EmailPriorityLabels[EmailPriority.NORMAL]).toBe('Normal');
      expect(EmailPriorityLabels[EmailPriority.HIGH]).toBe('Yüksek');
      expect(EmailPriorityLabels[EmailPriority.URGENT]).toBe('Acil');
    });
  });
});
