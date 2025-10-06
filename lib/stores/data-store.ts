// =====================================================
// DATA STORE - ZUSTAND
// =====================================================
// Data caching and management with Zustand
'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}
export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  type: string;
  consultantName?: string;
  subProjectCount?: number;
  assignedCompanies?: number;
  createdAt: string;
  updatedAt: string;
}
export interface Company {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  size?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
interface DataState {
  // Cache
  cache: Record<string, CacheItem>;
  cacheExpiry: number; // Default 5 minutes
  // Projects
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  // Companies
  companies: Company[];
  companiesLoading: boolean;
  companiesError: string | null;
  // Actions - Cache
  setCache: <T>(key: string, data: T, expiresIn?: number) => void;
  getCache: <T>(key: string) => T | null;
  clearCache: (key?: string) => void;
  clearExpiredCache: () => void;
  // Actions - Projects
  setProjects: (projects: Project[]) => void;
  setProjectsLoading: (loading: boolean) => void;
  setProjectsError: (error: string | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  // Actions - Companies
  setCompanies: (companies: Company[]) => void;
  setCompaniesLoading: (loading: boolean) => void;
  setCompaniesError: (error: string | null) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  // Reset
  reset: () => void;
}
export const useDataStore = create<DataState>()(
  immer((set, get) => ({
    // Initial State
    cache: {},
    cacheExpiry: 5 * 60 * 1000, // 5 minutes
    projects: [],
    projectsLoading: false,
    projectsError: null,
    companies: [],
    companiesLoading: false,
    companiesError: null,
    // Cache Actions
    setCache: (key, data, expiresIn) => {
      const now = Date.now();
      const expiresAt = now + (expiresIn || get().cacheExpiry);
      set(state => {
        state.cache[key] = {
          data,
          timestamp: now,
          expiresAt,
          key,
        };
      });
    },
    getCache: key => {
      const item = get().cache[key];
      if (!item) return null;
      if (Date.now() > item.expiresAt) {
        set(state => {
          delete state.cache[key];
        });
        return null;
      }
      return item.data;
    },
    clearCache: key => {
      if (key) {
        set(state => {
          delete state.cache[key];
        });
      } else {
        set(state => {
          state.cache = {};
        });
      }
    },
    clearExpiredCache: () => {
      const now = Date.now();
      set(state => {
        Object.keys(state.cache).forEach(key => {
          if (state.cache[key].expiresAt < now) {
            delete state.cache[key];
          }
        });
      });
    },
    // Projects Actions
    setProjects: projects =>
      set(state => {
        state.projects = projects;
        state.projectsError = null;
      }),
    setProjectsLoading: loading =>
      set(state => {
        state.projectsLoading = loading;
      }),
    setProjectsError: error =>
      set(state => {
        state.projectsError = error;
        state.projectsLoading = false;
      }),
    addProject: project =>
      set(state => {
        state.projects.push(project);
      }),
    updateProject: (id, updates) =>
      set(state => {
        const index = state.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          state.projects[index] = { ...state.projects[index], ...updates };
        }
      }),
    removeProject: id =>
      set(state => {
        state.projects = state.projects.filter(p => p.id !== id);
      }),
    // Companies Actions
    setCompanies: companies =>
      set(state => {
        state.companies = companies;
        state.companiesError = null;
      }),
    setCompaniesLoading: loading =>
      set(state => {
        state.companiesLoading = loading;
      }),
    setCompaniesError: error =>
      set(state => {
        state.companiesError = error;
        state.companiesLoading = false;
      }),
    addCompany: company =>
      set(state => {
        state.companies.push(company);
      }),
    updateCompany: (id, updates) =>
      set(state => {
        const index = state.companies.findIndex(c => c.id === id);
        if (index !== -1) {
          state.companies[index] = { ...state.companies[index], ...updates };
        }
      }),
    removeCompany: id =>
      set(state => {
        state.companies = state.companies.filter(c => c.id !== id);
      }),
    // Reset
    reset: () =>
      set(state => {
        state.cache = {};
        state.projects = [];
        state.projectsLoading = false;
        state.projectsError = null;
        state.companies = [];
        state.companiesLoading = false;
        state.companiesError = null;
      }),
  }))
);
