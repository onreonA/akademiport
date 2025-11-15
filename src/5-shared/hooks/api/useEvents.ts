import { useQuery } from '@tanstack/react-query';
import { EventResponseDto, EventListResponseDto, EventFilterDto } from '@/application/dto/event';

export const useEvents = (filters?: EventFilterDto) => {
  const queryParams = new URLSearchParams();
  if (filters?.programId) queryParams.append('programId', filters.programId);
  if (filters?.consultantId) queryParams.append('consultantId', filters.consultantId);
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.page) queryParams.append('page', String(filters.page));
  if (filters?.limit) queryParams.append('limit', String(filters.limit));

  const queryString = queryParams.toString();
  const queryKey = ['events', filters];

  return useQuery<EventListResponseDto, Error>({
    queryKey,
    queryFn: async () => {
      const url = queryString ? `/api/events?${queryString}` : '/api/events';
      console.log('Fetching events from:', url, 'with filters:', filters);
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Events fetch error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch events');
      }
      const data = await response.json();
      console.log('Events fetched successfully:', data);
      return data;
    },
    enabled: true, // Always enabled, even if programId is not selected
  });
};

export const useEvent = (eventId: string) => {
  return useQuery<{ success: boolean; event: EventResponseDto }, Error>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch event');
      }
      return response.json();
    },
    enabled: !!eventId,
  });
};
