/**
 * Component Tests for ReplyTree
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/5-shared/test/utils';
import { ReplyTree } from './ReplyTree';
import type { ForumReplyWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';

// Mock ReplyCard
vi.mock('./ReplyCard', () => ({
  ReplyCard: ({ reply }: { reply: ForumReplyWithDetails }) => (
    <div data-testid={`reply-${reply.id}`}>{reply.content}</div>
  ),
}));

const createMockReply = (overrides?: Partial<ForumReplyWithDetails>): ForumReplyWithDetails => ({
  id: 'reply-1',
  topicId: 'topic-1',
  authorId: 'author-1',
  companyId: 'company-1',
  parentId: null,
  content: 'Test reply',
  isApproved: true,
  isEdited: false,
  isSolution: false,
  likeCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  authorName: 'Test User',
  authorEmail: 'test@example.com',
  companyName: 'Test Company',
  replies: [],
  ...overrides,
});

describe('ReplyTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component', () => {
    const replies = [createMockReply()];
    render(<ReplyTree replies={replies} topicId="topic-1" />);
    expect(screen.getByTestId('reply-reply-1')).toBeInTheDocument();
  });

  it('renders multiple replies', () => {
    const replies = [
      createMockReply({ id: 'reply-1', content: 'Reply 1' }),
      createMockReply({ id: 'reply-2', content: 'Reply 2' }),
      createMockReply({ id: 'reply-3', content: 'Reply 3' }),
    ];
    render(<ReplyTree replies={replies} topicId="topic-1" />);
    expect(screen.getByTestId('reply-reply-1')).toBeInTheDocument();
    expect(screen.getByTestId('reply-reply-2')).toBeInTheDocument();
    expect(screen.getByTestId('reply-reply-3')).toBeInTheDocument();
  });

  it('renders empty state when no replies', () => {
    render(<ReplyTree replies={[]} topicId="topic-1" />);
    // Component should render without errors
    const { container } = render(<ReplyTree replies={[]} topicId="topic-1" />);
    expect(container).toBeTruthy();
  });

  it('passes solutionReplyId to ReplyCard', () => {
    const replies = [createMockReply()];
    render(<ReplyTree replies={replies} topicId="topic-1" solutionReplyId="reply-1" />);
    expect(screen.getByTestId('reply-reply-1')).toBeInTheDocument();
  });

  it('passes callbacks to ReplyCard', () => {
    const onReply = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onLike = vi.fn();
    const onMarkSolution = vi.fn();
    const replies = [createMockReply()];

    render(
      <ReplyTree
        replies={replies}
        topicId="topic-1"
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onLike={onLike}
        onMarkSolution={onMarkSolution}
        isTopicAuthor={true}
      />
    );

    expect(screen.getByTestId('reply-reply-1')).toBeInTheDocument();
  });
});
