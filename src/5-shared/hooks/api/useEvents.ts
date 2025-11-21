import { useQuery } from '@tanstack/react-query';
import { EventResponseDto, EventListResponseDto, EventFilterDto } from '@/2-application/dto/event';

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
        let errorMessage = 'Etkinlikler yüklenemedi';

        // Check if response has content
        const contentType = response.headers.get('content-type');
        const hasJsonContent = contentType && contentType.includes('application/json');

        try {
          if (hasJsonContent) {
            const errorData = await response.json();
            console.error('Events fetch error - Response:', {
              status: response.status,
              statusText: response.statusText,
              errorData,
            });

            // Extract error message properly
            if (errorData && typeof errorData === 'object') {
              if (errorData.error) {
                if (typeof errorData.error === 'string') {
                  errorMessage = errorData.error;
                } else if (typeof errorData.error === 'object' && errorData.error !== null) {
                  if ('message' in errorData.error) {
                    errorMessage = String(errorData.error.message);
                  } else {
                    errorMessage = JSON.stringify(errorData.error);
                  }
                } else {
                  errorMessage = String(errorData.error);
                }
              } else if (errorData.message) {
                errorMessage = String(errorData.message);
              } else if (Object.keys(errorData).length === 0) {
                // Empty object - use status text
                errorMessage = `HTTP ${response.status}: ${response.statusText || 'Etkinlikler yüklenemedi'}`;
              }
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          } else {
            // Not JSON response
            const text = await response.text();
            errorMessage =
              text ||
              `HTTP ${response.status}: ${response.statusText || 'Etkinlikler yüklenemedi'}`;
            console.error('Events fetch error - Non-JSON response:', {
              status: response.status,
              statusText: response.statusText,
              text,
            });
          }
        } catch (parseError) {
          // If parsing fails completely, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Etkinlikler yüklenemedi'}`;
          console.error('Failed to parse error response:', parseError);
        }

        throw new Error(errorMessage);
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
        let errorMessage = 'Etkinlik yüklenemedi';

        try {
          const errorData = await response.json();

          // Extract error message properly
          if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (typeof errorData.error === 'object' && errorData.error !== null) {
              if ('message' in errorData.error) {
                errorMessage = String(errorData.error.message);
              } else {
                errorMessage = JSON.stringify(errorData.error);
              }
            } else {
              errorMessage = String(errorData.error);
            }
          } else if (errorData.message) {
            errorMessage = String(errorData.message);
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Etkinlik yüklenemedi'}`;
        }

        throw new Error(errorMessage);
      }
      return response.json();
    },
    enabled: !!eventId,
  });
};
