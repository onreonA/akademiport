/**
 * Update Notification Preferences DTO
 *
 * DTO for updating user notification preferences
 */

import { z } from 'zod';
import { NotificationType, NotificationChannel } from '@/3-domain/enums/NotificationEnums';

const TypePreferenceSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  inApp: z.boolean().optional(),
});

export const UpdateNotificationPreferencesDtoSchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  typePreferences: z.record(z.nativeEnum(NotificationType), TypePreferenceSchema).optional(),
  quietHoursStart: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı gerekli (HH:mm)')
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı gerekli (HH:mm)')
    .optional(),
  quietHoursEnabled: z.boolean().optional(),
});

export type UpdateNotificationPreferencesDto = z.infer<
  typeof UpdateNotificationPreferencesDtoSchema
>;
