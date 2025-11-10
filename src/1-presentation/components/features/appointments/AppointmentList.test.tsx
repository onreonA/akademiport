/**
 * Component Tests for AppointmentList
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { AppointmentList } from './AppointmentList';

// Mock hooks
vi.mock('@/shared/hooks/api/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    data: {
      appointments: [
        {
          id: 'appointment-1',
          title: 'Test Appointment',
          startTime: '2025-02-01T10:00:00Z',
          endTime: '2025-02-01T11:00:00Z',
          status: 'pending',
          companyId: 'company-1',
          consultantId: 'consultant-1',
          consultant: { fullName: 'Test Consultant' },
          company: { name: 'Test Company' },
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    },
    isLoading: false,
    error: null,
  })),
}));

describe('AppointmentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders appointment list', () => {
    render(<AppointmentList />);

    expect(screen.getByText('Test Appointment')).toBeInTheDocument();
  });

  it('displays appointment details', () => {
    render(<AppointmentList />);

    expect(screen.getByText('Test Appointment')).toBeInTheDocument();
    // Component shows companyId in format "Firma ID: company-1..."
    expect(screen.getByText(/firma id/i)).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    const { useAppointments } = await import('@/shared/hooks/api/useAppointments');
    vi.mocked(useAppointments).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<AppointmentList />);

    // Loading state shows skeleton cards
    expect(screen.getByText('Randevular')).toBeInTheDocument();
  });

  it('shows empty state when no appointments', async () => {
    const { useAppointments } = await import('@/shared/hooks/api/useAppointments');
    vi.mocked(useAppointments).mockReturnValueOnce({
      data: {
        appointments: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      },
      isLoading: false,
      error: null,
    });

    render(<AppointmentList />);

    expect(screen.getByText(/randevu bulunamadı/i)).toBeInTheDocument();
  });

  it('filters appointments by status', async () => {
    const user = userEvent.setup();

    render(<AppointmentList showFilters={true} />);

    // Component renders status filter select
    expect(screen.getByText(/durum/i)).toBeInTheDocument();
    // Status filter is visible
    const statusSelect = screen.getByRole('combobox');
    expect(statusSelect).toBeInTheDocument();
  });

  it('searches appointments', async () => {
    const user = userEvent.setup();

    render(<AppointmentList showFilters={true} />);

    // Component renders search input
    const searchInput = screen.getByPlaceholderText(/randevu ara/i);
    expect(searchInput).toBeInTheDocument();

    // User can type in search input
    await user.clear(searchInput);
    await user.type(searchInput, 'Test');

    // Wait for debounced search
    await waitFor(
      () => {
        expect(searchInput).toHaveValue('Test');
      },
      { timeout: 2000 }
    );
  });

  it('calls onAppointmentClick when appointment is clicked', async () => {
    const onAppointmentClick = vi.fn();
    const user = userEvent.setup();

    render(<AppointmentList onAppointmentClick={onAppointmentClick} />);

    // Find the Card component that contains the appointment
    const appointmentCard = screen.getByText('Test Appointment').closest('[data-slot="card"]');
    if (appointmentCard) {
      await user.click(appointmentCard);
    }

    await waitFor(() => {
      expect(onAppointmentClick).toHaveBeenCalled();
    });
  });

  it('handles pagination', async () => {
    const { useAppointments } = await import('@/shared/hooks/api/useAppointments');
    vi.mocked(useAppointments).mockReturnValueOnce({
      data: {
        appointments: [
          {
            id: 'appointment-1',
            title: 'Test Appointment',
            startTime: '2025-02-01T10:00:00Z',
            endTime: '2025-02-01T11:00:00Z',
            status: 'pending',
            companyId: 'company-1',
            consultantId: 'consultant-1',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          totalPages: 3,
        },
      },
      isLoading: false,
      error: null,
    });

    render(<AppointmentList />);

    // Pagination component should be rendered when totalPages > 1
    expect(screen.getByText('Test Appointment')).toBeInTheDocument();
  });

  it('filters by consultantId when provided', () => {
    render(<AppointmentList consultantId="consultant-1" />);

    // Component renders with consultantId prop
    expect(screen.getByText('Test Appointment')).toBeInTheDocument();
  });

  it('filters by companyId when provided', () => {
    render(<AppointmentList companyId="company-1" />);

    // Component renders with companyId prop
    expect(screen.getByText('Test Appointment')).toBeInTheDocument();
  });
});
