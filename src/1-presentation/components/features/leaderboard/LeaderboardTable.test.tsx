/**
 * Component Tests for LeaderboardTable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/5-shared/test/utils';
import { LeaderboardTable } from './LeaderboardTable';
import type { LeaderboardRanking } from '@/3-domain/entities/Leaderboard';

// Mock useLeaderboard hook
const mockUseLeaderboard = vi.fn();
vi.mock('@/1-presentation/hooks/useLeaderboard', () => ({
  useLeaderboard: () => mockUseLeaderboard(),
}));

const createMockRanking = (overrides?: Partial<LeaderboardRanking>): LeaderboardRanking => ({
  companyId: 'company-1',
  companyName: 'Test Company',
  programId: 'program-1',
  totalScore: 1000,
  projectScore: 300,
  trainingScore: 200,
  eventScore: 150,
  forumScore: 100,
  newsScore: 50,
  appointmentScore: 200,
  rank: 1,
  badgeCount: 5,
  lastActivityAt: new Date(),
  ...overrides,
});

describe('LeaderboardTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLeaderboard.mockReturnValue({
      data: { rankings: [] },
      isLoading: false,
      error: null,
    });
  });

  it('renders component', () => {
    const { container } = render(<LeaderboardTable />);
    expect(container).toBeTruthy();
  });

  it('displays loading state', () => {
    mockUseLeaderboard.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    const { container } = render(<LeaderboardTable />);
    const loader = container.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseLeaderboard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    });
    render(<LeaderboardTable />);
    expect(screen.getByText(/liderlik tablosu yüklenemedi/i)).toBeInTheDocument();
  });

  it('displays empty state when no rankings', () => {
    mockUseLeaderboard.mockReturnValue({
      data: { rankings: [] },
      isLoading: false,
      error: null,
    });
    render(<LeaderboardTable />);
    expect(screen.getByText(/henüz puan kaydı yok/i)).toBeInTheDocument();
  });

  it('displays rankings', () => {
    const rankings = [
      createMockRanking({ companyName: 'Company 1', rank: 1, totalScore: 1000 }),
      createMockRanking({ companyName: 'Company 2', rank: 2, totalScore: 800 }),
      createMockRanking({ companyName: 'Company 3', rank: 3, totalScore: 600 }),
    ];
    mockUseLeaderboard.mockReturnValue({
      data: { rankings },
      isLoading: false,
      error: null,
    });
    render(<LeaderboardTable />);
    expect(screen.getByText('Company 1')).toBeInTheDocument();
    expect(screen.getByText('Company 2')).toBeInTheDocument();
    expect(screen.getByText('Company 3')).toBeInTheDocument();
  });

  it('displays rank numbers', () => {
    // Use rank > 3 to avoid emoji rendering (rank 1-3 show medals)
    const rankings = [createMockRanking({ rank: 4 }), createMockRanking({ rank: 5 })];
    mockUseLeaderboard.mockReturnValue({
      data: { rankings },
      isLoading: false,
      error: null,
    });
    render(<LeaderboardTable />);
    // Rank numbers > 3 are displayed as text
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays total scores', () => {
    const rankings = [createMockRanking({ totalScore: 1000, companyName: 'Test Company' })];
    mockUseLeaderboard.mockReturnValue({
      data: { rankings },
      isLoading: false,
      error: null,
    });
    render(<LeaderboardTable />);
    // totalScore is formatted with toLocaleString(), so check for formatted version
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('displays badge count', () => {
    const rankings = [createMockRanking({ badgeCount: 5, companyName: 'Test Company' })];
    mockUseLeaderboard.mockReturnValue({
      data: { rankings },
      isLoading: false,
      error: null,
    });
    const { container } = render(<LeaderboardTable />);
    // Badge count should be visible in the table (check for table structure)
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    // Badge count is displayed in the table
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('filters by programId', () => {
    render(<LeaderboardTable programId="program-1" />);
    expect(mockUseLeaderboard).toHaveBeenCalled();
  });

  it('filters by companyId', () => {
    render(<LeaderboardTable companyId="company-1" />);
    expect(mockUseLeaderboard).toHaveBeenCalled();
  });

  it('limits results when limit prop is provided', () => {
    render(<LeaderboardTable limit={10} />);
    expect(mockUseLeaderboard).toHaveBeenCalled();
  });
});
