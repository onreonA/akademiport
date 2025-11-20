/**
 * Unit Tests for AttendeeList Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { AttendeeList } from './AttendeeList';

const mockUseEventAttendees = vi.fn();

vi.mock('@/5-shared/hooks/api/useEventAttendees', () => ({
  useEventAttendees: () => mockUseEventAttendees(),
}));

const mockAttendees = [
  {
    id: 'attendee-1',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    companyId: 'company-1',
    companyName: 'Company 1',
    registeredAt: new Date().toISOString(),
    attendedAt: new Date().toISOString(),
    status: 'attended',
  },
  {
    id: 'attendee-2',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    companyId: 'company-2',
    companyName: 'Company 2',
    registeredAt: new Date().toISOString(),
    attendedAt: null,
    status: 'registered',
  },
];

describe('AttendeeList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEventAttendees.mockReturnValue({
      data: {
        attendees: [],
      },
      isLoading: false,
      error: null,
    });
  });

  it('renders component', () => {
    render(<AttendeeList eventId="event-1" />);
    expect(screen.getByText(/katılımcılar/i)).toBeInTheDocument();
  });

  it('displays loading state when loading', () => {
    mockUseEventAttendees.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<AttendeeList eventId="event-1" />);
    const loadingSpinner = container.querySelector('[class*="animate-spin"]');
    expect(loadingSpinner).toBeDefined();
  });

  it('displays empty state when no attendees', () => {
    mockUseEventAttendees.mockReturnValue({
      data: {
        attendees: [],
      },
      isLoading: false,
      error: null,
    });

    render(<AttendeeList eventId="event-1" />);
    expect(screen.getByText(/henüz katılımcı yok/i)).toBeInTheDocument();
  });

  it('displays attendees list', () => {
    mockUseEventAttendees.mockReturnValue({
      data: {
        attendees: mockAttendees,
      },
      isLoading: false,
      error: null,
    });

    render(<AttendeeList eventId="event-1" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays company names when showCompany is true', () => {
    mockUseEventAttendees.mockReturnValue({
      data: {
        attendees: mockAttendees,
      },
      isLoading: false,
      error: null,
    });

    render(<AttendeeList eventId="event-1" showCompany={true} />);
    expect(screen.getByText('Company 1')).toBeInTheDocument();
    expect(screen.getByText('Company 2')).toBeInTheDocument();
  });

  it('displays error message when error occurs', () => {
    mockUseEventAttendees.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Test error'),
    });

    render(<AttendeeList eventId="event-1" />);
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('displays attendee count in header', () => {
    mockUseEventAttendees.mockReturnValue({
      data: {
        attendees: mockAttendees,
      },
      isLoading: false,
      error: null,
    });

    render(<AttendeeList eventId="event-1" />);
    expect(screen.getByText(/katılımcılar \(2\)/i)).toBeInTheDocument();
  });
});
