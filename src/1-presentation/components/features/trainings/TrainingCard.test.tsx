/**
 * Unit Tests for TrainingCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { TrainingCard } from './TrainingCard';
import type { Training } from '@/domain/entities/Training';
import userEvent from '@testing-library/user-event';

describe('TrainingCard', () => {
  const createMockTraining = (overrides?: Partial<Training>): Training => {
    return {
      id: 'training-1',
      name: 'Test Training',
      description: 'Test description',
      programId: 'program-1',
      consultantId: 'consultant-1',
      status: 'active' as const,
      priority: 'medium' as const,
      isGlobal: false,
      isLocked: false,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      ...overrides,
    };
  };

  it('renders training card with basic information', () => {
    const training = createMockTraining();
    render(<TrainingCard training={training} />);

    expect(screen.getByText('Test Training')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays video and document counts', () => {
    const training = createMockTraining();
    render(<TrainingCard training={training} videosCount={5} documentsCount={3} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Döküman')).toBeInTheDocument();
  });

  it('displays progress bar when progress is provided', () => {
    const training = createMockTraining();
    render(<TrainingCard training={training} progress={75} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
    const progressBar = screen.getByText('İlerleme').closest('div')?.nextElementSibling;
    expect(progressBar).toBeInTheDocument();
  });

  it('shows global badge when training is global', () => {
    const training = createMockTraining({ isGlobal: true });
    render(<TrainingCard training={training} />);

    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('shows program-based badge when training is not global', () => {
    const training = createMockTraining({ isGlobal: false });
    render(<TrainingCard training={training} />);

    expect(screen.getByText('Program Bazlı')).toBeInTheDocument();
  });

  it('shows locked badge when training is locked', () => {
    const training = createMockTraining({ isLocked: true });
    render(<TrainingCard training={training} />);

    const lockedTexts = screen.getAllByText('Kilitli');
    expect(lockedTexts.length).toBeGreaterThan(0);
  });

  it('displays status badge', () => {
    const training = createMockTraining({ status: 'active' });
    render(<TrainingCard training={training} />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('displays priority badge when priority is provided', () => {
    const training = createMockTraining({ priority: 'high' });
    render(<TrainingCard training={training} />);

    expect(screen.getByText('Yüksek')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const training = createMockTraining();
    const handleClick = vi.fn();

    render(<TrainingCard training={training} onClick={handleClick} />);

    const card = screen.getByText('Test Training').closest('[class*="card"]');
    if (card) {
      await user.click(card);
      expect(handleClick).toHaveBeenCalledWith(training);
    }
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const training = createMockTraining();
    const handleEdit = vi.fn();

    render(<TrainingCard training={training} onEdit={handleEdit} />);

    const editButton = screen.getByRole('button', { name: /detaylar/i });
    await user.click(editButton);

    expect(handleEdit).toHaveBeenCalledWith(training);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const training = createMockTraining();
    const handleDelete = vi.fn();

    render(<TrainingCard training={training} onDelete={handleDelete} />);

    const deleteButton = screen.getByRole('button', { name: /sil/i });
    await user.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith(training);
  });

  it('does not show edit button when onEdit is not provided', () => {
    const training = createMockTraining();
    render(<TrainingCard training={training} />);

    expect(screen.queryByRole('button', { name: /detaylar/i })).not.toBeInTheDocument();
  });

  it('does not show delete button when onDelete is not provided', () => {
    const training = createMockTraining();
    render(<TrainingCard training={training} />);

    expect(screen.queryByRole('button', { name: /sil/i })).not.toBeInTheDocument();
  });

  it('displays creation date', () => {
    const training = createMockTraining({ createdAt: new Date('2025-01-15') });
    render(<TrainingCard training={training} />);

    expect(screen.getByText('Oluşturulma')).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const training = createMockTraining({ description: null });
    render(<TrainingCard training={training} />);

    expect(screen.getByText('Test Training')).toBeInTheDocument();
  });
});
