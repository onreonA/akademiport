/**
 * Notification Filter DTO
 *
 * DTO for filtering notifications
 */

import { z } from 'zod';
import { NotificationType, NotificationPriority } from '@/3-domain/enums/NotificationEnums';

export const NotificationFilterDtoSchema = z.object({
  userId: z.string().uuid('Geçerli bir kullanıcı ID gerekli'),
  isRead: z.boolean().optional(),
  type: z.nativeEnum(NotificationType).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  orderBy: z.enum(['created_at', 'priority', 'type']).optional().default('created_at'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type NotificationFilterDto = z.infer<typeof NotificationFilterDtoSchema>;
