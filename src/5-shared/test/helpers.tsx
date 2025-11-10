/**
 * Test Helpers for Component Testing
 *
 * Common utilities and helpers for testing React components
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Create a test QueryClient with default options
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Render component with React Query provider
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

/**
 * Wait for a Select component to be ready
 */
export async function waitForSelect(container?: HTMLElement) {
  const { waitFor, screen } = await import('@testing-library/react');
  const { expect } = await import('vitest');

  await waitFor(
    () => {
      const combobox = container
        ? container.querySelector('[role="combobox"]')
        : screen.queryByRole('combobox');
      expect(combobox).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
}

/**
 * Wait for a Dialog to be fully rendered
 */
export async function waitForDialog(title?: string | RegExp) {
  const { waitFor, screen } = await import('@testing-library/react');
  const { expect } = await import('vitest');

  await waitFor(
    () => {
      if (title) {
        const titleElement =
          typeof title === 'string' ? screen.getByText(title) : screen.getByText(title);
        expect(titleElement).toBeInTheDocument();
      } else {
        // Check for any dialog role
        const dialog = screen.queryByRole('dialog');
        expect(dialog).toBeInTheDocument();
      }
    },
    { timeout: 3000 }
  );
}

/**
 * Fill a form field by label
 */
export async function fillFormField(label: string | RegExp, value: string, user: any) {
  const { screen } = await import('@testing-library/react');
  const field = screen.getByLabelText(label);
  await user.clear(field);
  if (value) {
    await user.type(field, value);
  }
  return field;
}

/**
 * Select an option from a Select component
 */
export async function selectOption(
  optionText: string | RegExp,
  user: any,
  container?: HTMLElement
) {
  const { waitFor, screen } = await import('@testing-library/react');
  const { expect } = await import('vitest');

  // Find the combobox
  const combobox = container
    ? container.querySelector('[role="combobox"]')
    : screen.getByRole('combobox');

  if (!combobox) {
    throw new Error('Combobox not found');
  }

  // Click to open dropdown
  await user.click(combobox);

  // Wait for option to appear
  await waitFor(
    () => {
      const option =
        typeof optionText === 'string'
          ? screen.getByText(optionText)
          : screen.getByText(optionText);
      expect(option).toBeInTheDocument();
    },
    { timeout: 3000 }
  );

  // Click the option
  const option =
    typeof optionText === 'string' ? screen.getByText(optionText) : screen.getByText(optionText);
  await user.click(option);
}

/**
 * Submit a form by button text
 */
export async function submitForm(buttonText: string | RegExp, user: any) {
  const { screen, waitFor } = await import('@testing-library/react');
  const { expect } = await import('vitest');

  const submitButton =
    typeof buttonText === 'string'
      ? screen.getByRole('button', { name: buttonText })
      : screen.getByRole('button', { name: buttonText });

  expect(submitButton).toBeInTheDocument();
  expect(submitButton).not.toBeDisabled();

  await user.click(submitButton);

  // Wait for button to be disabled (loading state) or form to submit
  await waitFor(
    () => {
      // Form submission might disable the button or remove it
      const stillExists = document.contains(submitButton);
      if (stillExists) {
        // If still exists, it might be disabled during submission
        expect(submitButton).toBeDisabled();
      }
    },
    { timeout: 2000 }
  ).catch(() => {
    // Button might be removed after submission, which is fine
  });
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(timeout = 1000) {
  await new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Mock window methods that might be called by components
 */
export function setupWindowMocks() {
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
