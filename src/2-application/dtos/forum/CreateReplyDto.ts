import { z } from 'zod';
import { commonStringSchemas } from '@/5-shared/validation/common-schemas';

export const CreateReplyDtoSchema = z.object({
  topicId: commonStringSchemas.uuid('Geçersiz konu ID'),
  content: commonStringSchemas.content(1, 5000, 'Yanıt içeriği'),
  parentId: commonStringSchemas.uuid('Geçersiz üst yanıt ID').nullable().optional(),
});

export type CreateReplyDto = z.infer<typeof CreateReplyDtoSchema>;
