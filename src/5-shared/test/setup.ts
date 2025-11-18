import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local for integration tests
config({ path: resolve(process.cwd(), '.env.local') });

// Mock Next.js cookies() function for API route tests
vi.mock('next/headers', async () => {
  const actual = await vi.importActual<typeof import('next/headers')>('next/headers');
  return {
    ...actual,
    cookies: vi.fn(async () => ({
      get: vi.fn(),
      set: vi.fn(),
      getAll: vi.fn(() => []),
      has: vi.fn(),
      delete: vi.fn(),
    })),
  };
});

// Mock Supabase client creation for tests
vi.mock('@/4-infrastructure/database/supabase-server', () => {
  const mockSupabaseClient = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      containedBy: vi.fn().mockReturnThis(),
      rangeGt: vi.fn().mockReturnThis(),
      rangeGte: vi.fn().mockReturnThis(),
      rangeLt: vi.fn().mockReturnThis(),
      rangeLte: vi.fn().mockReturnThis(),
      rangeAdjacent: vi.fn().mockReturnThis(),
      overlaps: vi.fn().mockReturnThis(),
      textSearch: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      abortSignal: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      csv: vi.fn().mockResolvedValue({ data: '', error: null }),
      geojson: vi.fn().mockResolvedValue({ data: null, error: null }),
      explain: vi.fn().mockResolvedValue({ data: null, error: null }),
      rollback: vi.fn().mockReturnThis(),
      returns: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: '' }, error: null }),
      })),
    },
  };

  return {
    createClient: vi.fn(async () => mockSupabaseClient),
    getSupabaseAdminClient: vi.fn(() => mockSupabaseClient),
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => ({
    type: 'img',
    props: { src, alt, ...props },
  }),
}));

// Mock environment variables (only if not already set from .env.local)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock DOM APIs for Radix UI components and modern browser features
if (typeof Element !== 'undefined') {
  // PointerCapture API
  Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || (() => false);
  Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || (() => {});
  Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || (() => {});

  // Scroll APIs
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
  Element.prototype.scrollTo = Element.prototype.scrollTo || (() => {});
  Element.prototype.scroll = Element.prototype.scroll || (() => {});

  // Focus APIs
  HTMLElement.prototype.focus = HTMLElement.prototype.focus || (() => {});
  HTMLElement.prototype.blur = HTMLElement.prototype.blur || (() => {});

  // getBoundingClientRect - return a mock rectangle
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    if (originalGetBoundingClientRect) {
      try {
        return originalGetBoundingClientRect.call(this);
      } catch {
        // Fallback to mock
      }
    }
    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  };
}

// Mock getComputedStyle for Radix UI
if (typeof window !== 'undefined') {
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (element: Element, pseudoElement?: string | null) {
    if (originalGetComputedStyle) {
      try {
        return originalGetComputedStyle.call(window, element, pseudoElement);
      } catch {
        // Fallback to mock
      }
    }
    // Return a mock CSSStyleDeclaration
    return {
      getPropertyValue: () => '',
      setProperty: () => {},
      removeProperty: () => '',
      getPropertyPriority: () => '',
      item: () => '',
      length: 0,
      parentRule: null,
      cssText: '',
      ...Object.fromEntries(
        [
          'display',
          'position',
          'top',
          'left',
          'right',
          'bottom',
          'width',
          'height',
          'margin',
          'padding',
          'border',
          'zIndex',
          'opacity',
          'transform',
          'transition',
        ].map((prop) => [prop, ''])
      ),
    } as unknown as CSSStyleDeclaration;
  };
}

// Mock HTMLElement methods
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView || (() => {});
  HTMLElement.prototype.focus = HTMLElement.prototype.focus || (() => {});
  HTMLElement.prototype.blur = HTMLElement.prototype.blur || (() => {});
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Setup window mocks for browser APIs
if (typeof window !== 'undefined') {
  // Mock window.scrollTo
  window.scrollTo = window.scrollTo || (() => {});

  // Mock window.requestAnimationFrame
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    ((callback: FrameRequestCallback) => {
      setTimeout(callback, 16);
      return 0;
    });

  // Mock window.cancelAnimationFrame
  window.cancelAnimationFrame =
    window.cancelAnimationFrame ||
    ((id: number) => {
      clearTimeout(id);
    });
}
