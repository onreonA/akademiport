import { useQuery } from '@tanstack/react-query';
import type { EventStatisticsDto } from '@/application/dto/event/EventStatisticsDto';

export const useEventStatistics = (eventId: string) => {
  return useQuery<{ success: boolean; statistics: EventStatisticsDto }, Error>({
    queryKey: ['event-statistics', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/statistics`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch statistics');
      }
      return response.json();
    },
    enabled: !!eventId,
  });
};
