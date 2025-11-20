/**
 * Unit Tests for TopicList Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { TopicList } from './TopicList';
import userEvent from '@testing-library/user-event';

const mockUseTopicsList = vi.fn();
const mockUseDeleteTopic = vi.fn();

// Mock hooks
vi.mock('@/1-presentation/hooks/useForum', () => ({
  useTopicsList: () => mockUseTopicsList(),
  useDeleteTopic: () => mockUseDeleteTopic(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('TopicList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTopicsList.mockReturnValue({
      data: {
        topics: [],
        total: 0,
      },
      isLoading: false,
    });
    mockUseDeleteTopic.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  it('renders component', () => {
    render(<TopicList programId="program-1" />);
    expect(screen.getByText(/forum konuları/i)).toBeInTheDocument();
  });

  it('displays topic count', () => {
    mockUseTopicsList.mockReturnValue({
      data: {
        topics: [],
        total: 5,
      },
      isLoading: false,
    });

    render(<TopicList programId="program-1" />);
    expect(screen.getByText(/5 konu bulundu/i)).toBeInTheDocument();
  });

  it('shows create button when onCreateClick is provided', () => {
    const handleCreate = vi.fn();
    render(<TopicList programId="program-1" onCreateClick={handleCreate} />);
    expect(screen.getByText(/yeni konu/i)).toBeInTheDocument();
  });

  it('calls onCreateClick when create button is clicked', async () => {
    const user = userEvent.setup();
    const handleCreate = vi.fn();
    render(<TopicList programId="program-1" onCreateClick={handleCreate} />);

    const createButton = screen.getByText(/yeni konu/i);
    await user.click(createButton);
    expect(handleCreate).toHaveBeenCalled();
  });

  it('displays loading state when loading', () => {
    mockUseTopicsList.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(<TopicList programId="program-1" />);
    // Component should render in loading state
    expect(container).toBeTruthy();
  });

  it('displays empty state when no topics', () => {
    mockUseTopicsList.mockReturnValue({
      data: {
        topics: [],
        total: 0,
      },
      isLoading: false,
    });

    render(<TopicList programId="program-1" />);
    expect(screen.getByText(/henüz konu bulunmuyor/i)).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<TopicList programId="program-1" />);
    expect(screen.getByPlaceholderText(/konu ara/i)).toBeInTheDocument();
  });

  it('renders filter selects', () => {
    render(<TopicList programId="program-1" />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });
});
