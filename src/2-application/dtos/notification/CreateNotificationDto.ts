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

export const CreateNotificationDtoSchema = z.object({
  userId: z.string().uuid('Geçerli bir kullanıcı ID gerekli'),
  type: z.nativeEnum(NotificationType, {
    message: 'Geçerli bir bildirim tipi gerekli',
  }),
  title: z.string().min(1, 'Başlık gerekli').max(255, 'Başlık en fazla 255 karakter olabilir'),
  message: z.string().min(1, 'Mesaj gerekli'),
  actionUrl: z.string().url('Geçerli bir URL gerekli').optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  priority: z.nativeEnum(NotificationPriority).optional().default(NotificationPriority.NORMAL),
  channels: z
    .array(z.nativeEnum(NotificationChannel))
    .optional()
    .default([NotificationChannel.IN_APP]),
  expiresAt: z.string().datetime().optional(),
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationDtoSchema>;
