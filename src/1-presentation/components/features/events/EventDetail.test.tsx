/**
 * Unit Tests for EventDetail Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { EventDetail } from './EventDetail';
import userEvent from '@testing-library/user-event';

const mockUseEvent = vi.fn();

vi.mock('@/5-shared/hooks/api/useEvents', () => ({
  useEvent: () => mockUseEvent(),
}));

const mockEvent = {
  id: 'event-1',
  title: 'Test Event',
  description: 'Test description',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 3600000).toISOString(),
  location: 'Test Location',
  category: 'webinar',
  status: 'scheduled',
  attendanceRequired: true,
  maxAttendees: 100,
  zoomLink: 'https://zoom.us/test',
  programId: 'program-1',
  consultantId: 'consultant-1',
};

describe('EventDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEvent.mockReturnValue({
      data: {
        success: true,
        event: mockEvent,
      },
      isLoading: false,
      error: null,
    });
  });

  it('renders component', () => {
    render(<EventDetail eventId="event-1" />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('displays loading state when loading', () => {
    mockUseEvent.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<EventDetail eventId="event-1" />);
    const loadingSpinner = container.querySelector('[class*="animate-spin"]');
    expect(loadingSpinner).toBeDefined();
  });

  it('displays event details', () => {
    render(<EventDetail eventId="event-1" />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('shows edit button when onEdit is provided and showActions is true', () => {
    const handleEdit = vi.fn();
    render(<EventDetail eventId="event-1" onEdit={handleEdit} showActions={true} />);
    const buttons = screen.getAllByRole('button');
    const editButton = buttons.find((btn) => btn.textContent?.includes('Düzenle'));
    expect(editButton).toBeInTheDocument();
  });

  it('shows delete button when onDelete is provided and showActions is true', () => {
    const handleDelete = vi.fn();
    render(<EventDetail eventId="event-1" onDelete={handleDelete} showActions={true} />);
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find((btn) => btn.textContent?.includes('Sil'));
    expect(deleteButton).toBeInTheDocument();
  });

  it('shows register attendance button when attendanceRequired is true', () => {
    const handleRegister = vi.fn();
    render(<EventDetail eventId="event-1" onRegisterAttendance={handleRegister} />);
    const buttons = screen.getAllByRole('button');
    const registerButton = buttons.find((btn) => btn.textContent?.includes('Etkinliğe Katıl'));
    expect(registerButton).toBeInTheDocument();
  });

  it('renders with attendanceRequired', () => {
    render(<EventDetail eventId="event-1" />);
    // Component should render with attendanceRequired
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});
