// =====================================================
// API HOOKS
// =====================================================
// Data fetching hooks with Zustand integration
'use client';
import { useCallback } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useDataStore } from '@/lib/stores/data-store';
import { useUIStore } from '@/lib/stores/ui-store';
interface ApiOptions {
  cache?: boolean;
  cacheExpiry?: number;
  showLoading?: boolean;
  showError?: boolean;
  loadingKey?: string;
}
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: any;
}
export function useApi() {
  const { user, session } = useAuthStore();
  const { setCache, getCache, clearCache } = useDataStore();
  const { setLoadingState, showError, showSuccess } = useUIStore();
  const request = useCallback(
    async <T>(
      url: string,
      options: RequestInit = {},
      apiOptions: ApiOptions = {}
    ): Promise<ApiResponse<T>> => {
      const {
        cache = true,
        cacheExpiry = 5 * 60 * 1000, // 5 minutes
        showLoading = true,
        showError = true,
        loadingKey = 'api',
      } = apiOptions;
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
      }
    },
    [user, setCache, getCache, setLoadingState, showError, showSuccess]
  );
  return { request };
}
// Specific API hooks
export function useProjects() {
  const { request } = useApi();
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
      const result = await request(url, {}, { loadingKey: 'projects' });
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
        { loadingKey: 'project' }
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
        { loadingKey: 'createProject' }
      );
      if (result.success && result.data) {
        // Add to local state
        const { addProject } = useDataStore.getState();
        addProject(result.data as any);
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
        { loadingKey: 'updateProject' }
      );
      if (result.success && result.data) {
        // Update local state
        const { updateProject: updateLocalProject } = useDataStore.getState();
        updateLocalProject(id, result.data);
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
        { loadingKey: 'deleteProject' }
      );
      if (result.success) {
        // Remove from local state
        const { removeProject } = useDataStore.getState();
        removeProject(id);
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
export function useCompanies() {
  const { request } = useApi();
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
      const result = await request(url, {}, { loadingKey: 'companies' });
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
        { loadingKey: 'company' }
      );
      return result;
    },
    [request]
  );
  const createCompany = useCallback(
    async (data: any) => {
      const result = await request(
        '/api/v2/companies',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        { loadingKey: 'createCompany' }
      );
      if (result.success && result.data) {
        // Add to local state
        const { addCompany } = useDataStore.getState();
        addCompany(result.data as any);
      }
      return result;
    },
    [request]
  );
  const updateCompany = useCallback(
    async (id: string, data: any) => {
      const result = await request(
        `/api/v2/companies/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
        { loadingKey: 'updateCompany' }
      );
      if (result.success && result.data) {
        // Update local state
        const { updateCompany: updateLocalCompany } = useDataStore.getState();
        updateLocalCompany(id, result.data);
      }
      return result;
    },
    [request]
  );
  const deleteCompany = useCallback(
    async (id: string) => {
      const result = await request(
        `/api/v2/companies/${id}`,
        {
          method: 'DELETE',
        },
        { loadingKey: 'deleteCompany' }
      );
      if (result.success) {
        // Remove from local state
        const { removeCompany } = useDataStore.getState();
        removeCompany(id);
      }
      return result;
    },
    [request]
  );
  return {
    companies,
    fetchCompanies,
    fetchCompany,
    createCompany,
    updateCompany,
    deleteCompany,
  };
}
