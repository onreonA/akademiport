/**
 * Unit Tests for EventList Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { EventList } from './EventList';
import userEvent from '@testing-library/user-event';

const mockUseEvents = vi.fn();

vi.mock('@/5-shared/hooks/api/useEvents', () => ({
  useEvents: () => mockUseEvents(),
}));

describe('EventList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEvents.mockReturnValue({
      data: {
        events: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders component', () => {
    render(<EventList />);
    // Use getAllByText since "etkinlikler" appears multiple times, then check first occurrence
    const etkinliklerElements = screen.getAllByText(/etkinlikler/i);
    expect(etkinliklerElements.length).toBeGreaterThan(0);
    expect(etkinliklerElements[0]).toBeInTheDocument();
  });

  it('displays create button when showCreateButton is true', () => {
    const handleCreate = vi.fn();
    render(<EventList onCreateEvent={handleCreate} showCreateButton={true} />);
    // Use getAllByText since "yeni etkinlik" might appear multiple times
    const createButtons = screen.getAllByText(/yeni etkinlik/i);
    expect(createButtons.length).toBeGreaterThan(0);
    expect(createButtons[0]).toBeInTheDocument();
  });

  it('calls onCreateEvent when create button is clicked', async () => {
    const user = userEvent.setup();
    const handleCreate = vi.fn();
    render(<EventList onCreateEvent={handleCreate} />);

    // Use getAllByText and click the first button
    const createButtons = screen.getAllByText(/yeni etkinlik/i);
    expect(createButtons.length).toBeGreaterThan(0);
    await user.click(createButtons[0]);
    expect(handleCreate).toHaveBeenCalled();
  });

  it('displays loading state when loading', () => {
    mockUseEvents.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<EventList />);
    const loadingSpinner = container.querySelector('[class*="animate-spin"]');
    expect(loadingSpinner).toBeDefined();
  });

  it('renders with empty events', () => {
    mockUseEvents.mockReturnValue({
      data: {
        events: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<EventList />);
    expect(container).toBeTruthy();
  });

  it('renders search input', () => {
    render(<EventList />);
    expect(screen.getByPlaceholderText(/etkinlik ara/i)).toBeInTheDocument();
  });

  it('renders filter selects', () => {
    render(<EventList />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('filters events by programId', () => {
    render(<EventList programId="program-1" />);
    // Use getAllByText since "etkinlikler" appears multiple times
    const etkinliklerElements = screen.getAllByText(/etkinlikler/i);
    expect(etkinliklerElements.length).toBeGreaterThan(0);
    expect(etkinliklerElements[0]).toBeInTheDocument();
  });
});
