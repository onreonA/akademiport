'use client';

/**
 * React Query Provider
 * Provides QueryClient for React Query hooks
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 30 seconds (data is considered fresh for 30 seconds)
            staleTime: 30 * 1000,
            // Cache time: 5 minutes (data stays in cache for 5 minutes after last use)
            gcTime: 5 * 60 * 1000,
            // Retry failed requests 1 time
            retry: 1,
            // Refetch on window focus (useful for keeping data fresh)
            refetchOnWindowFocus: true,
            // Refetch on reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry failed mutations 1 time
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
