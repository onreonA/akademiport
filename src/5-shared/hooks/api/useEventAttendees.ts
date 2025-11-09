import { useQuery } from '@tanstack/react-query';
import type { EventAttendanceResponseDto } from '@/application/dto/event';

export const useEventAttendees = (eventId: string) => {
  return useQuery<{ success: boolean; attendees: EventAttendanceResponseDto[] }, Error>({
    queryKey: ['event-attendees', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/attendance`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch attendees');
      }
      return response.json();
    },
    enabled: !!eventId,
  });
};
