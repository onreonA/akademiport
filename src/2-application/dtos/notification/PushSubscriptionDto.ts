/**
 * Push Subscription DTO
 *
 * DTO for Web Push API subscription
 */

import { z } from 'zod';

export const PushSubscriptionDtoSchema = z.object({
  endpoint: z.string().url('Geçerli bir endpoint URL gerekli'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key gerekli'),
    auth: z.string().min(1, 'auth key gerekli'),
  }),
  userAgent: z.string().optional(),
});

export type PushSubscriptionDto = z.infer<typeof PushSubscriptionDtoSchema>;
