import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

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

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

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
  Element.prototype.focus = Element.prototype.focus || (() => {});
  Element.prototype.blur = Element.prototype.blur || (() => {});

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
    } as CSSStyleDeclaration;
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
