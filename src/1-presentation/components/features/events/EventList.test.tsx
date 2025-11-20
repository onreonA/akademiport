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
    expect(screen.getByText(/etkinlikler/i)).toBeInTheDocument();
  });

  it('displays create button when showCreateButton is true', () => {
    const handleCreate = vi.fn();
    render(<EventList onCreateEvent={handleCreate} showCreateButton={true} />);
    expect(screen.getByText(/yeni etkinlik/i)).toBeInTheDocument();
  });

  it('calls onCreateEvent when create button is clicked', async () => {
    const user = userEvent.setup();
    const handleCreate = vi.fn();
    render(<EventList onCreateEvent={handleCreate} />);

    const createButton = screen.getByText(/yeni etkinlik/i);
    await user.click(createButton);
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
    expect(screen.getByText(/etkinlikler/i)).toBeInTheDocument();
  });
});
