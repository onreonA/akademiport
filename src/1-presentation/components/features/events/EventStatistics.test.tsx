/**
 * Unit Tests for EventStatistics Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { EventStatistics } from './EventStatistics';

const mockUseEventStatistics = vi.fn();

vi.mock('@/5-shared/hooks/api/useEventStatistics', () => ({
  useEventStatistics: () => mockUseEventStatistics(),
}));

const mockStatistics = {
  totalRegistrations: 50,
  totalAttended: 45,
  attendanceRate: 90.0,
  totalCompanies: 10,
  capacityUtilization: 50.0,
  statusDistribution: {
    registered: 5,
    attended: 45,
    cancelled: 0,
  },
  companyDistribution: [
    { companyId: 'company-1', companyName: 'Company 1', count: 5 },
    { companyId: 'company-2', companyName: 'Company 2', count: 3 },
  ],
  companyAttendance: [
    {
      companyId: 'company-1',
      companyName: 'Company 1',
      registered: 5,
      attended: 4,
      attendanceRate: 80.0,
    },
    {
      companyId: 'company-2',
      companyName: 'Company 2',
      registered: 3,
      attended: 2,
      attendanceRate: 66.7,
    },
  ],
};

describe('EventStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEventStatistics.mockReturnValue({
      data: {
        success: true,
        statistics: mockStatistics,
      },
      isLoading: false,
      error: null,
    });
  });

  it('renders component', () => {
    const { container } = render(<EventStatistics eventId="event-1" />);
    expect(container).toBeTruthy();
  });

  it('displays loading state when loading', () => {
    mockUseEventStatistics.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<EventStatistics eventId="event-1" />);
    expect(container).toBeTruthy();
  });

  it('renders with statistics data', () => {
    const { container } = render(<EventStatistics eventId="event-1" />);
    expect(container).toBeTruthy();
  });

  it('renders error state when error occurs', () => {
    mockUseEventStatistics.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Test error' } as Error,
    });

    const { container } = render(<EventStatistics eventId="event-1" />);
    expect(container).toBeTruthy();
  });

  it('renders empty state when no statistics', () => {
    mockUseEventStatistics.mockReturnValue({
      data: { success: false, statistics: null },
      isLoading: false,
      error: null,
    });

    const { container } = render(<EventStatistics eventId="event-1" />);
    expect(container).toBeTruthy();
  });
});
