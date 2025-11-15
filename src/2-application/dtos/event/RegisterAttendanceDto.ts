import { z } from 'zod';

export const RegisterAttendanceDtoSchema = z.object({
  eventId: z.string().uuid('Geçersiz etkinlik ID'),
  userId: z.string().uuid('Geçersiz kullanıcı ID'),
  companyId: z.string().uuid('Geçersiz firma ID'),
  notes: z.string().optional(),
});

export type RegisterAttendanceDto = z.infer<typeof RegisterAttendanceDtoSchema>;



