/**
 * Unit Tests for TemplateCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { TemplateCard } from './TemplateCard';
import userEvent from '@testing-library/user-event';
import type { Project } from '@/domain/entities/Project';

describe('TemplateCard', () => {
  const createMockTemplate = (overrides?: Partial<Project>) => {
    return {
      id: 'template-1',
      name: 'Test Template',
      description: 'Test description',
      priority: 'medium' as const,
      created_at: new Date().toISOString(),
      _count: {
        sub_projects: 5,
      },
      ...overrides,
    };
  };

  it('renders template card with basic information', () => {
    const template = createMockTemplate();
    render(<TemplateCard template={template} />);

    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays priority badge', () => {
    const template = createMockTemplate({ priority: 'high' });
    render(<TemplateCard template={template} />);

    expect(screen.getByText('Yüksek')).toBeInTheDocument();
  });

  it('displays sub-project count', () => {
    const template = createMockTemplate({ _count: { sub_projects: 10 } });
    render(<TemplateCard template={template} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/alt proje/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const template = createMockTemplate();
    const handleEdit = vi.fn();

    render(<TemplateCard template={template} onEdit={handleEdit} />);

    const editButton = screen.getByRole('button', { name: /düzenle/i });
    await user.click(editButton);

    expect(handleEdit).toHaveBeenCalledWith('template-1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const template = createMockTemplate();
    const handleDelete = vi.fn();

    render(<TemplateCard template={template} onDelete={handleDelete} />);

    const deleteButton = screen.getByRole('button', { name: /sil/i });
    await user.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith('template-1');
  });

  it('calls onDuplicate when duplicate button is clicked', async () => {
    const user = userEvent.setup();
    const template = createMockTemplate();
    const handleDuplicate = vi.fn();

    render(<TemplateCard template={template} onDuplicate={handleDuplicate} />);

    const duplicateButton = screen.getByRole('button', { name: /kopyala/i });
    await user.click(duplicateButton);

    expect(handleDuplicate).toHaveBeenCalledWith('template-1');
  });

  it('calls onPreview when preview button is clicked', async () => {
    const user = userEvent.setup();
    const template = createMockTemplate();
    const handlePreview = vi.fn();

    render(<TemplateCard template={template} onPreview={handlePreview} />);

    const previewButton = screen.getByRole('button', { name: /önizle/i });
    await user.click(previewButton);

    expect(handlePreview).toHaveBeenCalledWith('template-1');
  });

  it('does not show buttons when handlers are not provided', () => {
    const template = createMockTemplate();
    render(<TemplateCard template={template} />);

    expect(screen.queryByRole('button', { name: /düzenle/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sil/i })).not.toBeInTheDocument();
  });

  it('displays creation date', () => {
    const template = createMockTemplate({ created_at: '2025-01-15T00:00:00Z' });
    render(<TemplateCard template={template} />);

    expect(screen.getByText(/oluşturulma/i)).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const template = createMockTemplate({ description: undefined });
    render(<TemplateCard template={template} />);

    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('displays different priority labels correctly', () => {
    const { rerender } = render(
      <TemplateCard template={createMockTemplate({ priority: 'low' })} />
    );
    expect(screen.getByText('Düşük')).toBeInTheDocument();

    rerender(<TemplateCard template={createMockTemplate({ priority: 'urgent' })} />);
    expect(screen.getByText('Acil')).toBeInTheDocument();
  });

  it('handles missing sub-project count', () => {
    const template = createMockTemplate({ _count: undefined });
    render(<TemplateCard template={template} />);

    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });
});
