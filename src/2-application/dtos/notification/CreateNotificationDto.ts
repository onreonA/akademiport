/**
 * Create Notification DTO
 *
 * DTO for creating a notification
 */

import { z } from 'zod';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@/3-domain/enums/NotificationEnums';

import { commonStringSchemas } from '@/5-shared/validation/common-schemas';

export const CreateNotificationDtoSchema = z.object({
  userId: commonStringSchemas.uuid('Geçerli bir kullanıcı ID gerekli'),
  type: z.nativeEnum(NotificationType, {
    message: 'Geçerli bir bildirim tipi gerekli',
  }),
  title: commonStringSchemas.title(1, 255, 'Bildirim başlığı'),
  message: commonStringSchemas.content(1, 1000, 'Bildirim mesajı'),
  actionUrl: commonStringSchemas.url('Geçerli bir URL gerekli').optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  priority: z.nativeEnum(NotificationPriority).optional().default(NotificationPriority.NORMAL),
  channels: z
    .array(z.nativeEnum(NotificationChannel))
    .optional()
    .default([NotificationChannel.IN_APP]),
  expiresAt: z.string().datetime('Geçersiz tarih formatı').optional(),
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationDtoSchema>;
