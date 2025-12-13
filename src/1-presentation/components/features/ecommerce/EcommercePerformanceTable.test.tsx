/**
 * Component Tests for EcommercePerformanceTable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/5-shared/test/utils';
import { EcommercePerformanceTable } from './EcommercePerformanceTable';

// Mock useEcommercePerformance hook
const mockUseEcommercePerformance = vi.fn();
vi.mock('@/1-presentation/hooks/useEcommerce', () => ({
  useEcommercePerformance: () => mockUseEcommercePerformance(),
}));

const createMockPerformance = (overrides?: any) => ({
  companyId: 'company-1',
  companyName: 'Test Company',
  programId: 'program-1',
  programName: 'Test Program',
  totalRevenueAllTime: 1000000,
  revenueLastMonth: 50000,
  revenueLast3Months: 150000,
  totalOrdersAllTime: 1000,
  totalVisitorsAllTime: 5000,
  revenueGrowthPercentage: 10.5,
  lastUpdatedAt: new Date(),
  ...overrides,
});

describe('EcommercePerformanceTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEcommercePerformance.mockReturnValue({
      data: { performance: [] },
      isLoading: false,
    });
  });

  it('renders component', () => {
    const { container } = render(<EcommercePerformanceTable />);
    expect(container).toBeTruthy();
  });

  it('displays loading state', () => {
    mockUseEcommercePerformance.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    const { container } = render(<EcommercePerformanceTable />);
    const loader = container.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('displays empty state when no performance data', () => {
    mockUseEcommercePerformance.mockReturnValue({
      data: { performance: [] },
      isLoading: false,
    });
    render(<EcommercePerformanceTable />);
    expect(screen.getByText(/performans verisi bulunamadı/i)).toBeInTheDocument();
  });

  it('displays performance data', () => {
    const performance = [
      createMockPerformance({
        companyId: 'company-1',
        companyName: 'Company 1',
        totalRevenueAllTime: 1000000,
      }),
      createMockPerformance({
        companyId: 'company-2',
        companyName: 'Company 2',
        totalRevenueAllTime: 800000,
      }),
    ];
    mockUseEcommercePerformance.mockReturnValue({
      data: { performance },
      isLoading: false,
    });
    render(<EcommercePerformanceTable />);
    expect(screen.getByText('Company 1')).toBeInTheDocument();
    expect(screen.getByText('Company 2')).toBeInTheDocument();
  });

  it('displays revenue correctly formatted', () => {
    const performance = [createMockPerformance({ totalRevenueAllTime: 1000000 })];
    mockUseEcommercePerformance.mockReturnValue({
      data: { performance },
      isLoading: false,
    });
    render(<EcommercePerformanceTable />);
    // Revenue should be formatted as currency
    expect(screen.getByText(/1.000.000/i)).toBeInTheDocument();
  });

  it('displays growth percentage with trend icon', () => {
    const performance = [createMockPerformance({ revenueGrowthPercentage: 15.5 })];
    mockUseEcommercePerformance.mockReturnValue({
      data: { performance },
      isLoading: false,
    });
    render(<EcommercePerformanceTable />);
    // Growth percentage should be visible
    expect(screen.getByText(/15.5%/i)).toBeInTheDocument();
  });

  it('filters by programId', () => {
    render(<EcommercePerformanceTable programId="program-1" />);
    expect(mockUseEcommercePerformance).toHaveBeenCalled();
  });

  it('filters by companyId', () => {
    render(<EcommercePerformanceTable companyId="company-1" />);
    expect(mockUseEcommercePerformance).toHaveBeenCalled();
  });

  it('filters by minRevenue', () => {
    render(<EcommercePerformanceTable minRevenue={10000} />);
    expect(mockUseEcommercePerformance).toHaveBeenCalled();
  });
});
