import { z } from 'zod';
import { commonStringSchemas } from '@/5-shared/validation/common-schemas';

export const UpdateReplyDtoSchema = z.object({
  content: commonStringSchemas.content(1, 5000, 'Yanıt içeriği'),
});

export type UpdateReplyDto = z.infer<typeof UpdateReplyDtoSchema>;
