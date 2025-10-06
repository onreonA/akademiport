// =====================================================
// OPTIMIZED API HOOKS
// =====================================================
// Optimized data fetching hooks with better caching and deduplication
'use client';
import { useCallback } from 'react';

import { useAuthUser } from '@/lib/stores/auth-store-optimized';
import { useDataStore } from '@/lib/stores/data-store';
import { useUIStore } from '@/lib/stores/ui-store';
interface ApiOptions {
  cache?: boolean;
  cacheExpiry?: number;
  showLoading?: boolean;
  showError?: boolean;
  loadingKey?: string;
  deduplicate?: boolean;
}
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: any;
}
// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();
export function useApiOptimized() {
  const user = useAuthUser();
  const { setCache, getCache } = useDataStore();
  const { setLoadingState, showError, showSuccess } = useUIStore();
  const request = useCallback(
    async <T>(
      url: string,
      options: RequestInit = {},
      apiOptions: ApiOptions = {}
    ): Promise<ApiResponse<T>> => {
      const {
        cache = true,
        cacheExpiry = 15 * 60 * 1000, // 15 minutes (increased from 5)
        showLoading = true,
        showError = true,
        loadingKey = 'api',
        deduplicate = true,
      } = apiOptions;
      // Create request key for deduplication
      const requestKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;
      // Check for pending duplicate request
      if (deduplicate && pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
      }
      // Check cache first
      if (cache) {
        const cached = getCache<T>(url);
        if (cached) {
          return { success: true, data: cached };
        }
      }
      // Set loading state
      if (showLoading) {
        setLoadingState(loadingKey, true);
      }
      // Create the request promise
      const requestPromise = (async (): Promise<ApiResponse<T>> => {
        try {
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
          };
          // Add auth header if user is authenticated
          if (user?.email) {
            (headers as any)['X-User-Email'] = user.email;
          }
          const response = await fetch(url, {
            ...options,
            headers,
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || 'API request failed');
          }
          // Cache successful response
          if (cache && result.data) {
            setCache(url, result.data, cacheExpiry);
          }
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'An error occurred';
          if (showError) {
            (showError as any)('API Error', errorMessage);
          }
          return {
            success: false,
            error: errorMessage,
          };
        } finally {
          if (showLoading) {
            setLoadingState(loadingKey, false);
          }
          // Remove from pending requests
          if (deduplicate) {
            pendingRequests.delete(requestKey);
          }
        }
      })();
      // Store the promise for deduplication
      if (deduplicate) {
        pendingRequests.set(requestKey, requestPromise);
      }
      return requestPromise;
    },
    [user, setCache, getCache, setLoadingState, showError, showSuccess]
  );
  return { request };
}
// Optimized projects hook with better caching
export function useProjectsOptimized() {
  const { request } = useApiOptimized();
  const { projects, setProjects, setProjectsLoading, setProjectsError } =
    useDataStore();
  const fetchProjects = useCallback(
    async (filters?: any) => {
      setProjectsLoading(true);
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, String(value));
        });
      }
      const url = `/api/v2/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const result = await request(
        url,
        {},
        {
          loadingKey: 'projects',
          cacheExpiry: 10 * 60 * 1000, // 10 minutes for projects
          deduplicate: true,
        }
      );
      if (result.success && result.data) {
        setProjects(result.data as any);
      } else {
        setProjectsError(result.error || 'Failed to fetch projects');
      }
      return result;
    },
    [request, setProjects, setProjectsLoading, setProjectsError]
  );
  const fetchProject = useCallback(
    async (id: string) => {
      const result = await request(
        `/api/v2/projects/${id}`,
        {},
        {
          loadingKey: 'project',
          cacheExpiry: 5 * 60 * 1000, // 5 minutes for single project
          deduplicate: true,
        }
      );
      return result;
    },
    [request]
  );
  const createProject = useCallback(
    async (data: any) => {
      const result = await request(
        '/api/v2/projects',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        {
          loadingKey: 'createProject',
          cache: false, // Don't cache POST requests
          deduplicate: false,
        }
      );
      if (result.success && result.data) {
        // Add to local state
        const { addProject } = useDataStore.getState();
        addProject(result.data as any);
        // Clear projects cache to force refresh
        // clearCache('/api/v2/projects');
      }
      return result;
    },
    [request]
  );
  const updateProject = useCallback(
    async (id: string, data: any) => {
      const result = await request(
        `/api/v2/projects/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
        {
          loadingKey: 'updateProject',
          cache: false, // Don't cache PUT requests
          deduplicate: false,
        }
      );
      if (result.success && result.data) {
        // Update local state
        const { updateProject: updateLocalProject } = useDataStore.getState();
        updateLocalProject(id, result.data);
        // Clear related caches
        // clearCache('/api/v2/projects');
        // clearCache(`/api/v2/projects/${id}`);
      }
      return result;
    },
    [request]
  );
  const deleteProject = useCallback(
    async (id: string) => {
      const result = await request(
        `/api/v2/projects/${id}`,
        {
          method: 'DELETE',
        },
        {
          loadingKey: 'deleteProject',
          cache: false, // Don't cache DELETE requests
          deduplicate: false,
        }
      );
      if (result.success) {
        // Remove from local state
        const { removeProject } = useDataStore.getState();
        removeProject(id);
        // Clear related caches
        // clearCache('/api/v2/projects');
        // clearCache(`/api/v2/projects/${id}`);
      }
      return result;
    },
    [request]
  );
  return {
    projects,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  };
}
// Optimized companies hook
export function useCompaniesOptimized() {
  const { request } = useApiOptimized();
  const { companies, setCompanies, setCompaniesLoading, setCompaniesError } =
    useDataStore();
  const fetchCompanies = useCallback(
    async (filters?: any) => {
      setCompaniesLoading(true);
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, String(value));
        });
      }
      const url = `/api/v2/companies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const result = await request(
        url,
        {},
        {
          loadingKey: 'companies',
          cacheExpiry: 20 * 60 * 1000, // 20 minutes for companies (less frequently changing)
          deduplicate: true,
        }
      );
      if (result.success && result.data) {
        setCompanies(result.data as any);
      } else {
        setCompaniesError(result.error || 'Failed to fetch companies');
      }
      return result;
    },
    [request, setCompanies, setCompaniesLoading, setCompaniesError]
  );
  const fetchCompany = useCallback(
    async (id: string) => {
      const result = await request(
        `/api/v2/companies/${id}`,
        {},
        {
          loadingKey: 'company',
          cacheExpiry: 15 * 60 * 1000, // 15 minutes for single company
          deduplicate: true,
        }
      );
      return result;
    },
    [request]
  );
  return {
    companies,
    fetchCompanies,
    fetchCompany,
  };
}
