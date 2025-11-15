/**
 * Component Tests for NewsCard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { NewsCard } from './NewsCard';
import { NewsCategory, NewsStatus } from '@/3-domain/enums/NewsEnums';
import type { NewsWithTags } from '@/3-domain/interfaces/repositories/INewsRepository';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock date-fns before importing NewsCard
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    return '01 Oca 2024';
  }),
}));

vi.mock('date-fns/locale', () => ({
  tr: {},
}));

const createMockNews = (overrides?: Partial<NewsWithTags>): NewsWithTags => ({
  id: 'news-1',
  programId: 'program-1',
  authorId: 'author-1',
  title: 'Test News Title',
  slug: 'test-news-title',
  summary: 'Test summary',
  content: 'Test content',
  category: NewsCategory.GENERAL,
  status: NewsStatus.PUBLISHED,
  imageUrl: null,
  imageAlt: null,
  metaDescription: null,
  metaKeywords: null,
  isFeatured: false,
  isPinned: false,
  readingTime: 5,
  viewCount: 100,
  likeCount: 10,
  commentCount: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date(),
  archivedAt: null,
  createdBy: 'author-1',
  updatedBy: 'author-1',
  tags: [],
  totalCount: 1,
  ...overrides,
});

describe('NewsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders news card with title', () => {
    const news = createMockNews();
    render(<NewsCard news={news} />);

    expect(screen.getByText('Test News Title')).toBeInTheDocument();
  });

  it('renders news summary when provided', () => {
    const news = createMockNews({ summary: 'Test summary text' });
    render(<NewsCard news={news} />);

    expect(screen.getByText('Test summary text')).toBeInTheDocument();
  });

  it('renders news image when provided', () => {
    const news = createMockNews({
      imageUrl: 'https://example.com/image.jpg',
      imageAlt: 'Test image',
    });
    render(<NewsCard news={news} />);

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('displays pinned badge when news is pinned', () => {
    const news = createMockNews({ isPinned: true, imageUrl: 'https://example.com/image.jpg' });
    render(<NewsCard news={news} />);

    // Badge text might be split across elements, use a more flexible matcher
    expect(screen.getByText(/sabitlenmiş/i)).toBeInTheDocument();
  });

  it('displays featured badge when news is featured', () => {
    const news = createMockNews({ isFeatured: true, imageUrl: 'https://example.com/image.jpg' });
    render(<NewsCard news={news} />);

    // Badge text might be split across elements, use a more flexible matcher
    expect(screen.getByText(/öne çıkan/i)).toBeInTheDocument();
  });

  it('displays category and status badges', () => {
    const news = createMockNews({
      category: NewsCategory.E_COMMERCE,
      status: NewsStatus.DRAFT,
    });
    render(<NewsCard news={news} />);

    expect(screen.getByText('E-ticaret')).toBeInTheDocument();
    expect(screen.getByText('Taslak')).toBeInTheDocument();
  });

  it('displays statistics (views, likes, comments)', () => {
    const news = createMockNews({
      viewCount: 100,
      likeCount: 10,
      commentCount: 5,
    });
    render(<NewsCard news={news} />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays reading time when provided', () => {
    const news = createMockNews({ readingTime: 5 });
    render(<NewsCard news={news} />);

    expect(screen.getByText('5 dk')).toBeInTheDocument();
  });

  it('displays tags when provided', () => {
    const news = createMockNews({
      tags: [
        {
          id: 'tag-1',
          name: 'Tag 1',
          slug: 'tag-1',
          usageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tag-2',
          name: 'Tag 2',
          slug: 'tag-2',
          usageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    render(<NewsCard news={news} />);

    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
  });

  it('shows "+N" badge when more than 3 tags', () => {
    const news = createMockNews({
      tags: [
        {
          id: 'tag-1',
          name: 'Tag 1',
          slug: 'tag-1',
          usageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tag-2',
          name: 'Tag 2',
          slug: 'tag-2',
          usageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tag-3',
          name: 'Tag 3',
          slug: 'tag-3',
          usageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tag-4',
          name: 'Tag 4',
          slug: 'tag-4',
          usageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    render(<NewsCard news={news} />);

    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('renders action buttons when showActions is true', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onPublish = vi.fn();
    const news = createMockNews({ status: NewsStatus.DRAFT });

    render(
      <NewsCard
        news={news}
        showActions={true}
        onEdit={onEdit}
        onDelete={onDelete}
        onPublish={onPublish}
      />
    );

    expect(screen.getByText('Yayınla')).toBeInTheDocument();
    expect(screen.getByText('Düzenle')).toBeInTheDocument();
    expect(screen.getByText('Sil')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const news = createMockNews();

    render(<NewsCard news={news} showActions={true} onEdit={onEdit} />);

    const editButton = screen.getByText('Düzenle');
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith('news-1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const news = createMockNews();

    render(<NewsCard news={news} showActions={true} onDelete={onDelete} />);

    const deleteButton = screen.getByText('Sil');
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('news-1');
  });

  it('calls onPublish when publish button is clicked', async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();
    const news = createMockNews({ status: NewsStatus.DRAFT });

    render(<NewsCard news={news} showActions={true} onPublish={onPublish} />);

    const publishButton = screen.getByText('Yayınla');
    await user.click(publishButton);

    expect(onPublish).toHaveBeenCalledWith('news-1');
  });

  it('does not show publish button for published news', () => {
    const onPublish = vi.fn();
    const news = createMockNews({ status: NewsStatus.PUBLISHED });

    render(<NewsCard news={news} showActions={true} onPublish={onPublish} />);

    expect(screen.queryByText('Yayınla')).not.toBeInTheDocument();
  });

  it('uses custom basePath for link', () => {
    const news = createMockNews();
    render(<NewsCard news={news} basePath="/admin-dashboard/news" />);

    const link = screen.getByRole('link', { name: /test news title/i });
    expect(link).toHaveAttribute('href', '/admin-dashboard/news/news-1');
  });

  it('displays author name when provided', () => {
    const news = createMockNews({ authorName: 'John Doe' });
    render(<NewsCard news={news} />);

    expect(screen.getByText(/Yazar: John Doe/i)).toBeInTheDocument();
  });
});
