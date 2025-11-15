/**
 * Component Tests for TopicCard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/5-shared/test/utils';
import { TopicCard } from './TopicCard';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import type { ForumTopicWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    return '01 Oca 2024';
  }),
}));

vi.mock('date-fns/locale', () => ({
  tr: {},
}));

const createMockTopic = (overrides?: Partial<ForumTopicWithDetails>): ForumTopicWithDetails => ({
  id: 'topic-1',
  categoryId: 'category-1',
  programId: 'program-1',
  authorId: 'author-1',
  companyId: 'company-1',
  title: 'Test Forum Topic',
  slug: 'test-forum-topic',
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

describe('TopicCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders topic card with title', () => {
    const topic = createMockTopic();
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText('Test Forum Topic')).toBeInTheDocument();
  });

  it('renders topic category', () => {
    const topic = createMockTopic();
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('renders topic author name', () => {
    const topic = createMockTopic();
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText(/Yazar: Test User/i)).toBeInTheDocument();
  });

  it('renders view count', () => {
    const topic = createMockTopic({ viewCount: 100 });
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders reply count', () => {
    const topic = createMockTopic({ replyCount: 15 });
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders like count', () => {
    const topic = createMockTopic({ likeCount: 8 });
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders pinned badge when topic is pinned', () => {
    const topic = createMockTopic({ isPinned: true });
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText('Sabitlenmiş')).toBeInTheDocument();
  });

  it('renders locked badge when topic is locked', () => {
    const topic = createMockTopic({ isLocked: true });
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText('Kilitli')).toBeInTheDocument();
  });

  it('renders solved badge when topic is solved', () => {
    const topic = createMockTopic({
      status: TopicStatus.SOLVED,
      solutionReplyId: 'reply-1',
    });
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    // "Çözüldü" appears both as status badge and solved badge, so we check for multiple
    const solvedBadges = screen.getAllByText('Çözüldü');
    expect(solvedBadges.length).toBeGreaterThan(0);
  });

  it('renders priority badge for high priority', () => {
    const topic = createMockTopic({ priority: TopicPriority.HIGH });
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    expect(screen.getByText('Yüksek')).toBeInTheDocument();
  });

  it('renders status badge for closed topic', () => {
    const topic = createMockTopic({ status: TopicStatus.CLOSED });
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    // Status badge should be rendered with the status label "Kapalı"
    expect(screen.getByText('Kapalı')).toBeInTheDocument();
  });

  it('renders link to topic detail page', () => {
    const topic = createMockTopic();
    render(<TopicCard topic={topic} basePath="/admin-dashboard/forum" />);

    const link = screen.getByRole('link', { name: /test forum topic/i });
    expect(link).toHaveAttribute('href', '/admin-dashboard/forum/topics/topic-1');
  });
});

