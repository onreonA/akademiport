/**
 * Unit Tests for ReplyForm Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { ReplyForm } from './ReplyForm';

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('ReplyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders form', () => {
    render(<ReplyForm topicId="topic-1" onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/yanıt yaz/i)).toBeInTheDocument();
  });

  it('displays correct label for reply to reply', () => {
    render(<ReplyForm topicId="topic-1" parentId="reply-1" onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/yanıtla/i)).toBeInTheDocument();
  });

  it('displays correct label for editing', () => {
    const initialData = {
      id: 'reply-1',
      topicId: 'topic-1',
      content: 'Test reply',
      authorId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <ReplyForm topicId="topic-1" initialData={initialData as any} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByLabelText(/yanıtı düzenle/i)).toBeInTheDocument();
  });

  it('pre-fills form with initial data', () => {
    const initialData = {
      id: 'reply-1',
      topicId: 'topic-1',
      content: 'Test reply content',
      authorId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <ReplyForm topicId="topic-1" initialData={initialData as any} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByDisplayValue('Test reply content')).toBeInTheDocument();
  });

  it('validates required content field', async () => {
    const user = userEvent.setup();
    render(<ReplyForm topicId="topic-1" onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /gönder/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/yanıt içeriği gereklidir/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data', async () => {
    const user = userEvent.setup();
    render(<ReplyForm topicId="topic-1" onSubmit={mockOnSubmit} />);

    const contentInput = screen.getByLabelText(/yanıt yaz/i);
    await user.type(contentInput, 'Test reply');

    const submitButton = screen.getByRole('button', { name: /gönder/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('renders cancel button when onCancel is provided', () => {
    render(<ReplyForm topicId="topic-1" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find((btn) => btn.textContent?.includes('İptal'));
    expect(cancelButton).toBeInTheDocument();
  });

  it('disables submit button when isSubmitting is true', () => {
    render(<ReplyForm topicId="topic-1" onSubmit={mockOnSubmit} isSubmitting={true} />);

    const submitButton = screen.getByRole('button', { name: /gönder/i });
    expect(submitButton).toBeDisabled();
  });

  it('resets form after successful submit', async () => {
    const user = userEvent.setup();
    render(<ReplyForm topicId="topic-1" onSubmit={mockOnSubmit} />);

    const contentInput = screen.getByLabelText(/yanıt yaz/i);
    await user.type(contentInput, 'Test reply');

    const submitButton = screen.getByRole('button', { name: /gönder/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Form should be reset
    await waitFor(() => {
      expect(contentInput).toHaveValue('');
    });
  });
});
