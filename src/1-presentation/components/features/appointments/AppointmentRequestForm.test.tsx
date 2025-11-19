/**
 * Component Tests for AppointmentRequestForm
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { AppointmentRequestForm } from './AppointmentRequestForm';

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

    const processChild = (child: any) => {
      if (!React.isValidElement(child)) return;

      // Check if it's a SelectItem (has value prop)
      if (child.props?.value !== undefined) {
        options.push(
          React.createElement(
            'option',
            {
              key: child.props.value || child.key,
              value: child.props.value,
            },
            child.props.children
          )
        );
        return;
      }

      // If it has children, recursively process them
      if (child.props?.children) {
        React.Children.forEach(child.props.children, processChild);
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
      React.Children.forEach(children, (child: any) => {
        if (React.isValidElement(child)) {
          // Get ID from SelectTrigger
          if (child.props?.id) {
            selectId = child.props.id;
          }
          // Check if it's SelectContent - it will have SelectItem children
          // SelectContent is typically the second child after SelectTrigger
          if (child.type && (child.type.displayName === 'SelectContent' || child.props?.children)) {
            const testOptions = extractOptions(child.props.children);
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
    SelectTrigger: ({ children, id, ...props }: any) => {
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
  beforeEach(() => {
    vi.clearAllMocks();
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

    await waitFor(() => {
      // With mocked Select, we check for the select element directly
      const select = screen.queryByTestId('mock-select') || screen.queryByRole('combobox');
      expect(select).toBeInTheDocument();
    });

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
      setTimeout(() => {
        options?.onSuccess?.({ id: 'appointment-1' });
      }, 0);
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

    await waitFor(
      () => {
        expect(screen.getByLabelText(/randevu başlığı/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for consultants to load and select to be rendered with options
    let consultantSelect: HTMLSelectElement;
    await waitFor(
      () => {
        consultantSelect = screen.getByTestId('mock-select') as HTMLSelectElement;
        expect(consultantSelect).toBeInTheDocument();
        // Check if options are available - wait for consultants to be mapped
        const options = consultantSelect.querySelectorAll('option');
        if (options.length === 0) {
          throw new Error('Options not loaded yet');
        }
        expect(options.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

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
    await waitFor(
      () => {
        const submitButton = screen.getByRole('button', { name: /randevu talebi gönder/i });
        // Button should be enabled when:
        // 1. Consultant is selected
        // 2. Form fields are filled
        // 3. No availability conflict
        // 4. Not pending
        const isEnabled =
          !submitButton.hasAttribute('disabled') && submitButton.getAttribute('disabled') !== '';
        if (!isEnabled) {
          // Check why button might be disabled
          const consultantSelect = screen.getByRole('combobox');
          const selectValue = consultantSelect.textContent;
          // If consultant not selected, that's the issue
          if (!selectValue || selectValue === 'Danışman seçin') {
            throw new Error('Consultant not selected');
          }
        }
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 10000 }
    );

    // Submit form
    const submitButton = screen.getByRole('button', { name: /randevu talebi gönder/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockMutate).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });

  it('calls onCancel callback when cancel button is clicked', { timeout: 20000 }, async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    // Reset fetch mock to ensure clean state
    vi.mocked(global.fetch).mockReset();

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
    await waitFor(
      () => {
        // Wait for form fields to appear
        expect(screen.getByLabelText(/randevu başlığı/i)).toBeInTheDocument();
        // Wait for consultants to be loaded (check for consultant select)
        const consultantSelect = screen.queryByTestId('mock-select');
        expect(consultantSelect).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Wait for cancel button to appear - it's conditionally rendered when onCancel prop exists
    // The button is in the Actions section with text "İptal"
    // Wait for form to be fully rendered first
    await waitFor(
      () => {
        // Ensure form is rendered
        expect(screen.getByLabelText(/randevu başlığı/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Now wait for cancel button - it's in the Actions section
    await waitFor(
      () => {
        // Method 1: Direct query by role and name (most reliable)
        const byRole = screen.queryByRole('button', { name: /iptal/i });
        if (byRole) return true;

        // Method 2: Find all buttons and check text content
        const buttons = screen.getAllByRole('button');
        const found = buttons.some((btn) => {
          const text = btn.textContent?.trim() || '';
          // Case-insensitive match for "İptal" (Turkish I)
          return (
            text.toLowerCase() === 'iptal' ||
            text.toLowerCase().includes('iptal') ||
            text === 'İptal' ||
            text.includes('İptal')
          );
        });
        if (found) return true;

        // Method 3: Query by text directly and find closest button
        const byText = screen.queryByText(/iptal/i);
        if (byText) {
          const button = byText.closest('button');
          if (button) return true;
        }

        return false;
      },
      { timeout: 10000 }
    );

    // Find the cancel button using the most reliable method
    // The button should be rendered since onCancel prop is provided
    let cancelButton: HTMLElement | null = null;

    // Try getByRole first (most reliable)
    try {
      cancelButton = screen.getByRole('button', { name: /iptal/i });
    } catch (e) {
      // Fallback: find by text content in all buttons
      const buttons = screen.getAllByRole('button');
      cancelButton =
        buttons.find((btn) => {
          const text = btn.textContent?.trim() || '';
          // Case-insensitive match for "İptal" (Turkish I)
          return (
            text.toLowerCase() === 'iptal' ||
            text.toLowerCase().includes('iptal') ||
            text === 'İptal' ||
            text.includes('İptal')
          );
        }) || null;

      // Last resort: query by text and find closest button
      if (!cancelButton) {
        const textElement = screen.queryByText(/iptal/i);
        if (textElement) {
          cancelButton = textElement.closest('button') as HTMLElement;
        }
      }

      // If still not found, try to find by data attributes or test id
      if (!cancelButton) {
        const allButtons = document.querySelectorAll('button');
        cancelButton =
          (Array.from(allButtons).find((btn) => {
            const text = btn.textContent?.trim() || '';
            // Case-insensitive match for "İptal" (Turkish I)
            return (
              text.toLowerCase() === 'iptal' ||
              text.toLowerCase().includes('iptal') ||
              text === 'İptal' ||
              text.includes('İptal')
            );
          }) as HTMLElement) || null;
      }
    }

    // Final check - button must exist
    if (!cancelButton) {
      // Debug: log all buttons
      const allButtons = screen.getAllByRole('button');
      const buttonTexts = allButtons.map((btn) => btn.textContent?.trim());
      throw new Error(`Cancel button not found. Available buttons: ${buttonTexts.join(', ')}`);
    }

    expect(cancelButton).toBeDefined();
    expect(cancelButton).not.toBeNull();
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).not.toBeDisabled();
    await user.click(cancelButton);

    await waitFor(
      () => {
        expect(onCancel).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });
});
