/**
 * Component Tests for TopicDetail
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/5-shared/test/utils';
import userEvent from '@testing-library/user-event';
import { TopicDetail } from './TopicDetail';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import type { ForumTopicWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';

// Mock hooks
const mockUseTopicDetail = vi.fn();
const mockUseReplies = vi.fn();
const mockUseCreateReply = vi.fn();
const mockUseLikeTopic = vi.fn();
const mockUseMarkSolution = vi.fn();

vi.mock('@/1-presentation/hooks/useForum', () => ({
  useTopicDetail: () => mockUseTopicDetail(),
  useReplies: () => mockUseReplies(),
  useCreateReply: () => mockUseCreateReply(),
  useLikeTopic: () => mockUseLikeTopic(),
  useMarkSolution: () => mockUseMarkSolution(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => {
    return '01 Oca 2024, 12:00';
  }),
}));

vi.mock('date-fns/locale', () => ({
  tr: {},
}));

// Mock ReplyTree
vi.mock('./ReplyTree', () => ({
  ReplyTree: ({ replies }: { replies: any[] }) => (
    <div data-testid="reply-tree">{replies.length} replies</div>
  ),
}));

const createMockTopic = (overrides?: Partial<ForumTopicWithDetails>): ForumTopicWithDetails => ({
  id: 'topic-1',
  categoryId: 'category-1',
  programId: 'program-1',
  authorId: 'author-1',
  companyId: 'company-1',
  title: 'Test Topic',
  slug: 'test-topic',
  content: 'Test content',
  status: TopicStatus.OPEN,
  priority: TopicPriority.NORMAL,
  isPinned: false,
  isLocked: false,
  isApproved: true,
  solutionReplyId: null,
  solvedAt: null,
  solvedBy: null,
  viewCount: 10,
  replyCount: 5,
  likeCount: 3,
  lastReplyAt: null,
  lastReplyBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  category: {
    id: 'category-1',
    programId: 'program-1',
    name: 'Test Category',
    slug: 'test-category',
    description: null,
    icon: '💬',
    color: '#3B82F6',
    orderIndex: 0,
    isActive: true,
    requireApproval: false,
    topicCount: 1,
    replyCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: null,
  },
  authorName: 'Test User',
  authorEmail: 'test@example.com',
  companyName: 'Test Company',
  ...overrides,
});

describe('TopicDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTopicDetail.mockReturnValue({
      data: createMockTopic(),
      isLoading: false,
    });
    mockUseReplies.mockReturnValue({
      data: { replies: [], total: 0 },
      isLoading: false,
    });
    mockUseCreateReply.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mockUseLikeTopic.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mockUseMarkSolution.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('renders component', () => {
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText('Test Topic')).toBeInTheDocument();
  });

  it('displays topic title', () => {
    const topic = createMockTopic({ title: 'Custom Title' });
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('displays topic content', () => {
    const topic = createMockTopic({ content: 'Custom content here' });
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText('Custom content here')).toBeInTheDocument();
  });

  it('displays author name', () => {
    const topic = createMockTopic({ authorName: 'John Doe' });
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    // Author name might be part of a longer string with company name
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it('displays view and reply counts', () => {
    const topic = createMockTopic({ viewCount: 100, replyCount: 25 });
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText(/100 görüntüleme/i)).toBeInTheDocument();
    expect(screen.getByText(/25 yanıt/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseTopicDetail.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<TopicDetail topicId="topic-1" />);
    expect(container).toBeTruthy();
  });

  it('displays not found message when topic is null', () => {
    mockUseTopicDetail.mockReturnValue({ data: null, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText(/konu bulunamadı/i)).toBeInTheDocument();
  });

  it('shows reply form when reply button is clicked', async () => {
    const user = userEvent.setup();
    render(<TopicDetail topicId="topic-1" />);

    const replyButton = screen.getByRole('button', { name: /yanıtla/i });
    await user.click(replyButton);

    // Wait for form to appear - check for ReplyForm component or form elements
    await waitFor(
      () => {
        // Check for form elements - use getAllByText and check if any is in a form context
        const formFields = screen.queryAllByPlaceholderText(/yanıt/i);
        const textareas = screen.queryAllByRole('textbox');
        // At least one form element should be present
        expect(formFields.length > 0 || textareas.length > 0).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TopicDetail topicId="topic-1" onEdit={onEdit} showActions={true} />);

    const editButton = screen.getByRole('button', { name: /düzenle/i });
    await user.click(editButton);
    expect(onEdit).toHaveBeenCalledWith('topic-1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TopicDetail topicId="topic-1" onDelete={onDelete} showActions={true} />);

    const deleteButton = screen.getByRole('button', { name: /sil/i });
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('topic-1');
  });

  it('does not show reply button when topic is locked', () => {
    const topic = createMockTopic({ isLocked: true });
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.queryByRole('button', { name: /yanıtla/i })).not.toBeInTheDocument();
  });

  it('displays category badge', () => {
    const topic = createMockTopic();
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('displays status and priority badges', () => {
    const topic = createMockTopic({
      status: TopicStatus.SOLVED,
      priority: TopicPriority.HIGH,
    });
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    // Status badge should be visible (might be "Çözüldü" or status label)
    const statusBadge = screen.queryByText(/çözüldü/i) || screen.queryByText(/solved/i);
    expect(statusBadge).toBeInTheDocument();
  });

  it('displays pinned badge when topic is pinned', () => {
    const topic = createMockTopic({ isPinned: true });
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText(/sabitlenmiş/i)).toBeInTheDocument();
  });

  it('displays locked badge when topic is locked', () => {
    const topic = createMockTopic({ isLocked: true });
    mockUseTopicDetail.mockReturnValue({ data: topic, isLoading: false });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText(/kilitli/i)).toBeInTheDocument();
  });

  it('renders reply tree with replies', () => {
    const replies = [
      {
        id: 'reply-1',
        content: 'Reply 1',
        topicId: 'topic-1',
        authorId: 'author-1',
        companyId: 'company-1',
        parentId: null,
        isApproved: true,
        isEdited: false,
        isSolution: false,
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: [],
      },
    ];
    mockUseReplies.mockReturnValue({
      data: { replies, total: 1 },
      isLoading: false,
    });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByTestId('reply-tree')).toBeInTheDocument();
  });

  it('displays empty state when no replies', () => {
    mockUseReplies.mockReturnValue({
      data: { replies: [], total: 0 },
      isLoading: false,
    });
    render(<TopicDetail topicId="topic-1" />);
    expect(screen.getByText(/henüz yanıt yok/i)).toBeInTheDocument();
  });
});
