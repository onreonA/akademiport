import { vi } from 'vitest';

// Mock Supabase Client
export const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseQuery),
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  },
  rpc: vi.fn(),
};

// Mock Supabase Query Builder
export const mockSupabaseQuery = {
  select: vi.fn(() => mockSupabaseQuery),
  insert: vi.fn(() => mockSupabaseQuery),
  update: vi.fn(() => mockSupabaseQuery),
  delete: vi.fn(() => mockSupabaseQuery),
  eq: vi.fn(() => mockSupabaseQuery),
  neq: vi.fn(() => mockSupabaseQuery),
  gt: vi.fn(() => mockSupabaseQuery),
  gte: vi.fn(() => mockSupabaseQuery),
  lt: vi.fn(() => mockSupabaseQuery),
  lte: vi.fn(() => mockSupabaseQuery),
  like: vi.fn(() => mockSupabaseQuery),
  ilike: vi.fn(() => mockSupabaseQuery),
  is: vi.fn(() => mockSupabaseQuery),
  in: vi.fn(() => mockSupabaseQuery),
  contains: vi.fn(() => mockSupabaseQuery),
  containedBy: vi.fn(() => mockSupabaseQuery),
  range: vi.fn(() => mockSupabaseQuery),
  order: vi.fn(() => mockSupabaseQuery),
  limit: vi.fn(() => mockSupabaseQuery),
  single: vi.fn(() => Promise.resolve({ data: null, error: null })),
  maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
  then: vi.fn((resolve) => resolve({ data: [], error: null })),
};

// Helper to reset all mocks
export const resetSupabaseMocks = () => {
  vi.clearAllMocks();
};

// Helper to mock successful response
export const mockSupabaseSuccess = (data: any) => {
  mockSupabaseQuery.then.mockImplementation((resolve) => resolve({ data, error: null }));
  mockSupabaseQuery.single.mockResolvedValue({ data, error: null });
  mockSupabaseQuery.maybeSingle.mockResolvedValue({ data, error: null });
};

// Helper to mock error response
export const mockSupabaseError = (error: any) => {
  mockSupabaseQuery.then.mockImplementation((resolve) => resolve({ data: null, error }));
  mockSupabaseQuery.single.mockResolvedValue({ data: null, error });
  mockSupabaseQuery.maybeSingle.mockResolvedValue({ data: null, error });
};
