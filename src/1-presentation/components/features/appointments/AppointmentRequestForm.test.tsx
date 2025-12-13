/**
 * Component Tests for AppointmentRequestForm
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { AppointmentRequestForm } from './AppointmentRequestForm';
import { waitForElement, waitForAsync } from '@/shared/test/flaky-test-helpers';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock hooks
vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'company-user-1',
      companyId: 'company-1',
      email: 'user@company.com',
    },
  })),
}));

vi.mock('@/shared/hooks/api/useAppointments', () => ({
  useCreateAppointment: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock Radix UI Select to avoid portal issues
vi.mock('@/presentation/components/ui/atoms/select', async () => {
  const React = await import('react');

  // Helper to extract options from SelectContent - handle both direct children and mapped arrays
  const extractOptions = (children: any): React.ReactElement[] => {
    const options: React.ReactElement[] = [];

    const processChild = (child: React.ReactNode) => {
      if (!React.isValidElement(child)) return;

      const props = child.props as { value?: string; children?: React.ReactNode };

      // Check if it's a SelectItem (has value prop)
      if (props.value !== undefined) {
        options.push(
          React.createElement(
            'option',
            {
              key: props.value || child.key,
              value: props.value,
            },
            props.children
          )
        );
        return;
      }

      // If it has children, recursively process them
      if (props.children) {
        React.Children.forEach(props.children, processChild);
      }
    };

    React.Children.forEach(children, processChild);
    return options;
  };

  return {
    Select: ({ children, value, onValueChange, ...props }: any) => {
      // Find SelectContent and extract options
      let options: React.ReactElement[] = [];
      let selectId = 'consultant'; // Default ID

      // Process children to find SelectContent and SelectTrigger
      React.Children.forEach(children, (child: React.ReactNode) => {
        if (React.isValidElement(child)) {
          const props = child.props as { id?: string; children?: React.ReactNode };
          const type = child.type as { displayName?: string };

          // Get ID from SelectTrigger
          if (props.id) {
            selectId = props.id;
          }
          // Check if it's SelectContent - it will have SelectItem children
          // SelectContent is typically the second child after SelectTrigger
          if (type && (type.displayName === 'SelectContent' || props.children)) {
            const testOptions = extractOptions(props.children);
            if (testOptions.length > 0) {
              options = testOptions;
            }
          }
        }
      });

      // If no options found, try to extract from all children recursively
      if (options.length === 0) {
        options = extractOptions(children);
      }

      return (
        <select
          id={selectId}
          value={value || ''}
          onChange={(e) => onValueChange?.(e.target.value)}
          data-testid="mock-select"
          {...props}
        >
          {options}
        </select>
      );
    },
    SelectTrigger: () => {
      // Return null since Select will render the select element directly
      return null;
    },
    SelectValue: ({ placeholder }: any) => {
      return React.createElement('span', { 'data-testid': 'mock-select-value' }, placeholder);
    },
    SelectContent: ({ children }: any) => {
      return React.createElement('div', { 'data-testid': 'mock-select-content' }, children);
    },
    SelectItem: ({ children, value, ...props }: any) => {
      return React.createElement('option', { value, ...props }, children);
    },
  };
});

describe('AppointmentRequestForm', () => {
  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock before each test
    vi.mocked(global.fetch).mockReset();
  });

  it('renders form fields', async () => {
    // Mock fetch for company and consultants
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { programId: 'program-1' } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: 'consultant-1', fullName: 'Test Consultant', email: 'test@test.com' }],
        }),
      } as Response);

    render(<AppointmentRequestForm />);

    // Wait for form to be fully rendered using flaky test helper
    await waitForElement(
      () => {
        const select = screen.queryByTestId('mock-select') || screen.queryByRole('combobox');
        return select as HTMLElement | null;
      },
      { timeout: 5000 }
    );

    // Wait for all form fields to be visible
    await waitForAsync(
      async () => {
        const titleField = screen.queryByLabelText(/randevu başlığı/i);
        const descriptionField = screen.queryByLabelText(/açıklama/i);
        const startTimeField = screen.queryByLabelText(/başlangıç tarihi ve saati/i);
        const endTimeField = screen.queryByLabelText(/bitiş tarihi ve saati/i);
        return !!(titleField && descriptionField && startTimeField && endTimeField);
      },
      { timeout: 5000 }
    );

    expect(screen.getByLabelText(/randevu başlığı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/açıklama/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/başlangıç tarihi ve saati/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bitiş tarihi ve saati/i)).toBeInTheDocument();
  });

  it('displays loading state when fetching consultants', async () => {
    vi.mocked(global.fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: { programId: 'program-1' } }),
      } as Response)
    );

    vi.mocked(global.fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ consultants: [] }),
      } as Response)
    );

    render(<AppointmentRequestForm />);

    // Should show loading indicator
    await waitFor(() => {
      expect(screen.queryByText(/yükleniyor/i)).toBeInTheDocument();
    });
  });

  it('shows error when company has no program', async () => {
    vi.mocked(global.fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response)
    );

    render(<AppointmentRequestForm />);

    // Component shows error message via toast, check for consultant loading message or empty state
    await waitFor(() => {
      // Component will show "Programınıza atanmış danışman bulunmamaktadır" when no consultants
      expect(
        screen.getByText(/programınıza atanmış danışman bulunmamaktadır/i)
      ).toBeInTheDocument();
    });
  });

  it('allows user to fill form fields', async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { programId: 'program-1' } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: 'consultant-1', fullName: 'Test Consultant', email: 'consultant@test.com' }],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { isAvailable: true, conflicts: [] } }),
      } as Response);

    render(<AppointmentRequestForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/randevu başlığı/i)).toBeInTheDocument();
    });

    // Select consultant - Radix UI Select uses portal, so we need to wait for it
    const consultantSelect = screen.getByRole('combobox');

    // Click to open the select dropdown
    await user.click(consultantSelect);

    // Wait for the SelectContent portal to render
    await waitFor(
      () => {
        // Radix UI Select renders options in a portal, look for SelectItem by text
        const option = screen.queryByText('Test Consultant', { selector: '[role="option"]' });
        if (!option) {
          // Alternative: look for any element containing the text
          const allOptions = screen.queryAllByText('Test Consultant');
          const selectItem = allOptions.find((el) => {
            const role = el.getAttribute('role');
            const dataValue = el.getAttribute('data-value');
            return role === 'option' || dataValue !== null;
          });
          if (selectItem) {
            return true;
          }
        }
        return option !== null;
      },
      { timeout: 3000 }
    );

    // Find and click the SelectItem - use keyboard navigation as fallback
    const selectItem =
      screen.queryByText('Test Consultant', { selector: '[role="option"]' }) ||
      screen.queryAllByText('Test Consultant').find((el) => el.getAttribute('data-value') !== null);

    if (selectItem) {
      // Try clicking, but if it fails, use keyboard navigation
      try {
        await user.click(selectItem);
      } catch {
        // Fallback: use keyboard to select
        await user.keyboard('{ArrowDown}{Enter}');
      }
    } else {
      // Fallback: type the consultant name or use keyboard
      await user.keyboard('{ArrowDown}{Enter}');
    }

    // Fill title
    const titleInput = screen.getByLabelText(/randevu başlığı/i);
    await user.type(titleInput, 'Test Appointment');

    expect(titleInput).toHaveValue('Test Appointment');
  });

  it('calls onSuccess callback after successful submission', { timeout: 20000 }, async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    // Setup mock for useCreateAppointment BEFORE resetting fetch
    const { useCreateAppointment } = await import('@/shared/hooks/api/useAppointments');
    const mockMutate = vi.fn((data, options) => {
      // Call onSuccess synchronously for test
      Promise.resolve().then(() => {
        options?.onSuccess?.({ id: 'appointment-1' });
      });
    });

    vi.mocked(useCreateAppointment).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    // Reset fetch mock to ensure clean state
    vi.mocked(global.fetch).mockReset();

    // Mock fetch calls in order: company, consultants, availability check (when dates are entered)
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'company-1',
            programId: '123e4567-e89b-12d3-a456-426614174000',
            program_id: '123e4567-e89b-12d3-a456-426614174000', // Also include program_id for compatibility
            name: 'Test Company',
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              fullName: 'Test Consultant',
              email: 'consultant@test.com',
            },
          ],
        }),
      } as Response)
      // Mock availability check - called when dates are entered
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { isAvailable: true, conflicts: [] } }),
      } as Response)
      // Additional mock for any subsequent availability checks
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { isAvailable: true, conflicts: [] } }),
      } as Response);

    render(<AppointmentRequestForm onSuccess={onSuccess} />);

    // Wait for form to be fully rendered
    await waitForElement(() => screen.queryByLabelText(/randevu başlığı/i) as HTMLElement | null, {
      timeout: 5000,
    });

    // Wait for consultants to load and select to be rendered with options
    let consultantSelect: HTMLSelectElement;
    await waitForAsync(
      async () => {
        consultantSelect = screen.getByTestId('mock-select') as HTMLSelectElement;
        if (!consultantSelect) return false;
        const options = consultantSelect.querySelectorAll('option');
        return options.length > 0;
      },
      { timeout: 10000 }
    );
    consultantSelect = screen.getByTestId('mock-select') as HTMLSelectElement;
    expect(consultantSelect).toBeInTheDocument();

    // Select the consultant by setting the value directly
    await user.selectOptions(consultantSelect!, '123e4567-e89b-12d3-a456-426614174001');

    // Wait for selection to be applied and state to update
    await waitFor(
      () => {
        expect(consultantSelect!.value).toBe('123e4567-e89b-12d3-a456-426614174001');
      },
      { timeout: 3000 }
    );

    // Give component time to process the selection
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Fill form
    const titleInput = screen.getByLabelText(/randevu başlığı/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Test Appointment');

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTimeStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}T10:00`;
    const endTimeStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}T11:00`;

    const startTimeInput = screen.getByLabelText(/başlangıç tarihi ve saati/i);
    await user.clear(startTimeInput);
    await user.type(startTimeInput, startTimeStr);

    const endTimeInput = screen.getByLabelText(/bitiş tarihi ve saati/i);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, endTimeStr);

    // Wait for availability check and form to be ready
    await waitFor(
      () => {
        expect(startTimeInput).toHaveValue(startTimeStr);
        expect(endTimeInput).toHaveValue(endTimeStr);
      },
      { timeout: 3000 }
    );

    // Wait for availability check to complete and form to be valid
    // The submit button is disabled when availabilityStatus === 'conflict' or createAppointment.isPending
    // Also need to ensure consultant is selected
    await waitForAsync(
      async () => {
        const submitButton = screen.queryByRole('button', { name: /randevu talebi gönder/i });
        if (!submitButton) return false;
        const isDisabled =
          submitButton.hasAttribute('disabled') || submitButton.getAttribute('disabled') === '';
        return !isDisabled;
      },
      { timeout: 10000 }
    );

    const submitButton = screen.getByRole('button', { name: /randevu talebi gönder/i });
    expect(submitButton).not.toBeDisabled();

    // Submit form
    await user.click(submitButton);

    // Wait for mutation and success callback
    await waitForAsync(
      async () => {
        return mockMutate.mock.calls.length > 0;
      },
      { timeout: 5000 }
    );

    // Wait for onSuccess callback (may be async)
    await waitFor(
      () => {
        expect(mockMutate).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it('calls onCancel callback when cancel button is clicked', { timeout: 20000 }, async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    // Mock fetch for company and consultants (component fetches both)
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'company-1',
            programId: '123e4567-e89b-12d3-a456-426614174000',
            program_id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Company',
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: 'consultant-1', fullName: 'Test Consultant', email: 'test@test.com' }],
        }),
      } as Response);

    render(<AppointmentRequestForm onCancel={onCancel} />);

    // Wait for component to fully load - consultants need to be fetched and mapped
    await waitForElement(() => screen.queryByLabelText(/randevu başlığı/i) as HTMLElement | null, {
      timeout: 5000,
      checkVisibility: false,
    });

    // Wait for consultant select to be available
    await waitForAsync(
      async () => {
        const select = screen.queryByTestId('mock-select');
        return select !== null;
      },
      { timeout: 5000 }
    );

    // Wait for form to be fully rendered and cancel button to appear
    // Cancel button is conditionally rendered when onCancel prop exists
    await waitForAsync(
      async () => {
        // Try to find cancel button by role
        const byRole = screen.queryByRole('button', { name: /iptal/i });
        if (byRole) return true;

        // Try to find by text in all buttons
        const buttons = screen.getAllByRole('button');
        const found = buttons.some((btn) => {
          const text = btn.textContent?.trim() || '';
          return (
            text.toLowerCase() === 'iptal' ||
            text.toLowerCase().includes('iptal') ||
            text === 'İptal' ||
            text.includes('İptal')
          );
        });
        return found;
      },
      { timeout: 10000 }
    );

    // Find the cancel button
    let cancelButton: HTMLElement | null = null;

    // Try getByRole first
    try {
      cancelButton = screen.getByRole('button', { name: /iptal/i });
    } catch {
      // Fallback: find by text content
      const buttons = screen.getAllByRole('button');
      cancelButton =
        buttons.find((btn) => {
          const text = btn.textContent?.trim() || '';
          return (
            text.toLowerCase() === 'iptal' ||
            text.toLowerCase().includes('iptal') ||
            text === 'İptal' ||
            text.includes('İptal')
          );
        }) || null;
    }

    if (!cancelButton) {
      // Debug: log all buttons
      const allButtons = screen.getAllByRole('button');
      const buttonTexts = allButtons.map((btn) => btn.textContent?.trim());
      throw new Error(`Cancel button not found. Available buttons: ${buttonTexts.join(', ')}`);
    }

    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).not.toBeDisabled();

    await user.click(cancelButton);

    await waitFor(
      () => {
        expect(onCancel).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });
});
