/**
 * Unit Tests for TopicForm Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { TopicForm } from './TopicForm';
import { TopicPriority } from '@/3-domain/enums/ForumEnums';
import { ForumCategory } from '@/3-domain/entities/Forum';

const mockCategories: ForumCategory[] = [
  {
    id: 'cat-1',
    name: 'Category 1',
    slug: 'category-1',
    programId: 'program-1',
    description: null,
    icon: null,
    color: null,
    orderIndex: 0,
    isActive: true,
    requireApproval: false,
    topicCount: 0,
    replyCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: null,
  },
  {
    id: 'cat-2',
    name: 'Category 2',
    slug: 'category-2',
    programId: 'program-1',
    description: null,
    icon: null,
    color: null,
    orderIndex: 1,
    isActive: true,
    requireApproval: false,
    topicCount: 0,
    replyCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: null,
  },
];

const mockOnSubmit = vi.fn();

describe('TopicForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders form fields', () => {
    render(<TopicForm programId="program-1" categories={mockCategories} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/kategori/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/başlık/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/konu içeriği/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/öncelik/i)).toBeInTheDocument();
  });

  it('pre-fills form with initial data', () => {
    const initialData = {
      id: 'topic-1',
      categoryId: 'cat-1',
      title: 'Test Topic',
      content: 'Test content',
      priority: TopicPriority.HIGH,
      programId: 'program-1',
      authorId: 'user-1',
      status: 'pending' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <TopicForm
        programId="program-1"
        categories={mockCategories}
        initialData={initialData as any}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByDisplayValue('Test Topic')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<TopicForm programId="program-1" categories={mockCategories} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /gönder|oluştur/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/kategori gereklidir/i)).toBeInTheDocument();
    });
  });

  it('renders submit button', () => {
    render(<TopicForm programId="program-1" categories={mockCategories} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /gönder|oluştur/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('disables submit button when isSubmitting is true', () => {
    render(
      <TopicForm
        programId="program-1"
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /gönder|oluştur/i });
    expect(submitButton).toBeDisabled();
  });

  it('disables category select when editing', () => {
    const initialData = {
      id: 'topic-1',
      categoryId: 'cat-1',
      title: 'Test Topic',
      content: 'Test content',
      priority: TopicPriority.NORMAL,
      programId: 'program-1',
      authorId: 'user-1',
      status: 'pending' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <TopicForm
        programId="program-1"
        categories={mockCategories}
        initialData={initialData as any}
        onSubmit={mockOnSubmit}
      />
    );

    const categorySelect = screen.getByLabelText(/kategori/i);
    expect(categorySelect).toBeDisabled();
  });
});
