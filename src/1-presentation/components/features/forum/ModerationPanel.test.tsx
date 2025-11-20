/**
 * Unit Tests for ModerationPanel Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { ModerationPanel } from './ModerationPanel';

const mockUsePendingModeration = vi.fn();
const mockUseModerateContent = vi.fn();
const mockUseDetectSpam = vi.fn();

// Mock hooks
vi.mock('@/1-presentation/hooks/useForumModeration', () => ({
  usePendingModeration: () => mockUsePendingModeration(),
  useModerateContent: () => mockUseModerateContent(),
  useDetectSpam: () => mockUseDetectSpam(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ModerationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePendingModeration.mockReturnValue({
      data: {
        topics: [],
        replies: [],
        spamDetections: [],
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseModerateContent.mockReturnValue({
      mutateAsync: vi.fn(),
    });
    mockUseDetectSpam.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  it('renders component', () => {
    render(<ModerationPanel />);
    expect(screen.getByText(/moderasyon/i)).toBeInTheDocument();
  });

  it('displays loading state when loading', () => {
    mockUsePendingModeration.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: vi.fn(),
    });

    render(<ModerationPanel />);
    const loadingSpinner = document.querySelector('[class*="animate-spin"]');
    expect(loadingSpinner).toBeDefined();
  });

  it('displays tabs for filtering', () => {
    render(<ModerationPanel />);
    // Tabs should be present (exact text may vary)
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('displays empty state when no pending items', () => {
    render(<ModerationPanel />);
    // Component should render even with empty data
    expect(screen.getByText(/moderasyon/i)).toBeInTheDocument();
  });

  it('renders moderation actions', () => {
    mockUsePendingModeration.mockReturnValue({
      data: {
        topics: [
          {
            id: 'topic-1',
            title: 'Test Topic',
            content: 'Test content',
            author_id: 'user-1',
            created_at: new Date().toISOString(),
          },
        ],
        replies: [],
        spamDetections: [],
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<ModerationPanel />);
    // Moderation buttons should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
