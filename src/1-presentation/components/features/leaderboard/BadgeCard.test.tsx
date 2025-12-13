/**
 * Component Tests for BadgeCard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/5-shared/test/utils';
import { BadgeCard } from './BadgeCard';
import type { LeaderboardBadge } from '@/3-domain/entities/Leaderboard';

const createMockBadge = (overrides?: Partial<LeaderboardBadge>): LeaderboardBadge => ({
  id: 'badge-1',
  name: 'Test Badge',
  description: 'Test badge description',
  icon: '🏆',
  category: 'project',
  requirementType: 'count',
  requirementValue: 10,
  requirementActivity: 'task_completed',
  pointsBonus: 50,
  orderIndex: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('BadgeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component', () => {
    const badge = createMockBadge();
    render(<BadgeCard badge={badge} />);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('displays badge name', () => {
    const badge = createMockBadge({ name: 'E-ticaret Ustası' });
    render(<BadgeCard badge={badge} />);
    expect(screen.getByText('E-ticaret Ustası')).toBeInTheDocument();
  });

  it('displays badge description', () => {
    const badge = createMockBadge({ description: '10 görev tamamladın' });
    render(<BadgeCard badge={badge} />);
    expect(screen.getByText('10 görev tamamladın')).toBeInTheDocument();
  });

  it('displays badge icon', () => {
    const badge = createMockBadge({ icon: '🎯' });
    render(<BadgeCard badge={badge} />);
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('displays earned badge when earned prop is true', () => {
    const badge = createMockBadge();
    const { container } = render(<BadgeCard badge={badge} earned={true} />);
    // Earned badge should have ring-primary class
    const card = container.querySelector('.ring-2.ring-primary');
    expect(card).toBeInTheDocument();
  });

  it('displays points bonus', () => {
    const badge = createMockBadge({ pointsBonus: 100 });
    render(<BadgeCard badge={badge} />);
    expect(screen.getByText(/\+100 bonus puan/i)).toBeInTheDocument();
  });
});
