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
      expect(screen.getByLabelText(/danışman/i)).toBeInTheDocument();
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

    // Select consultant first
    const consultantSelect = screen.getByRole('combobox');
    await user.click(consultantSelect);
    await waitFor(() => {
      expect(screen.getByText('Test Consultant')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Test Consultant'));

    // Fill title
    const titleInput = screen.getByLabelText(/randevu başlığı/i);
    await user.type(titleInput, 'Test Appointment');

    expect(titleInput).toHaveValue('Test Appointment');
  });

  it('calls onSuccess callback after successful submission', async () => {
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
      .mockResolvedValueOnce({
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

    // Wait for consultants to load
    await waitFor(
      () => {
        const combobox = screen.queryByRole('combobox');
        expect(combobox).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Select consultant - use a more reliable approach
    const consultantSelect = screen.getByRole('combobox');
    await user.click(consultantSelect);

    // Wait for dropdown to open and option to appear
    await waitFor(
      () => {
        expect(screen.getByText('Test Consultant')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await user.click(screen.getByText('Test Consultant'));

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

    // Wait a bit more for availability check to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

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

  it('calls onCancel callback when cancel button is clicked', async () => {
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

    // Wait for component to load and cancel button to appear
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /iptal/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const cancelButton = screen.getByRole('button', { name: /iptal/i });
    await user.click(cancelButton);

    await waitFor(
      () => {
        expect(onCancel).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });
});
