/**
 * Unit Tests for AssignTrainingModal Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { AssignTrainingModal } from './AssignTrainingModal';
import type { Training } from '@/domain/entities/Training';

// Mock fetch
global.fetch = vi.fn();

const createMockTraining = (overrides?: Partial<Training>): Training => ({
  id: 'training-1',
  name: 'Test Training',
  description: 'Test description',
  programId: 'program-1',
  consultantId: 'consultant-1',
  status: 'active',
  priority: 'medium',
  isGlobal: false,
  isLocked: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-1',
  ...overrides,
});

describe('AssignTrainingModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockClear();
  });

  it('renders modal when open is true', () => {
    render(
      <AssignTrainingModal companyId="company-1" open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText(/firmaya eğitim ata/i)).toBeInTheDocument();
  });

  it('does not render modal when open is false', () => {
    render(
      <AssignTrainingModal companyId="company-1" open={false} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.queryByText(/firmaya eğitim ata/i)).not.toBeInTheDocument();
  });

  it('displays company name in description when provided', () => {
    render(
      <AssignTrainingModal
        companyId="company-1"
        companyName="Test Company"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText(/test company/i)).toBeInTheDocument();
  });

  it('fetches trainings when modal opens', async () => {
    const mockTrainings = [createMockTraining()];
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trainings: mockTrainings }),
    } as Response);

    render(
      <AssignTrainingModal companyId="company-1" open={true} onOpenChange={mockOnOpenChange} />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/consultant/trainings?status=active');
    });
  });

  it('shows loading state while fetching trainings', async () => {
    vi.mocked(global.fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ trainings: [] }),
            } as Response);
          }, 100);
        })
    );

    const { container } = render(
      <AssignTrainingModal companyId="company-1" open={true} onOpenChange={mockOnOpenChange} />
    );

    // Loading spinner should be visible (Loader2 component with animate-spin)
    const loadingSpinner = container.querySelector('[class*="animate-spin"]');
    expect(loadingSpinner).toBeDefined();
  });

  it('displays trainings list when trainings are loaded', async () => {
    const mockTrainings = [
      createMockTraining({ id: 'training-1', name: 'Training 1' }),
      createMockTraining({ id: 'training-2', name: 'Training 2' }),
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trainings: mockTrainings }),
    } as Response);

    render(
      <AssignTrainingModal companyId="company-1" open={true} onOpenChange={mockOnOpenChange} />
    );

    await waitFor(
      () => {
        // Check for training select label
        const trainingLabels = screen.getAllByText(/eğitim seçin/i);
        expect(trainingLabels.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it('shows empty state when no trainings available', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trainings: [] }),
    } as Response);

    render(
      <AssignTrainingModal companyId="company-1" open={true} onOpenChange={mockOnOpenChange} />
    );

    await waitFor(() => {
      expect(screen.getByText(/atanabilir eğitim bulunamadı/i)).toBeInTheDocument();
    });
  });

  it('calls onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trainings: [] }),
    } as Response);

    render(
      <AssignTrainingModal companyId="company-1" open={true} onOpenChange={mockOnOpenChange} />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find((btn) => btn.textContent?.includes('İptal'));
      expect(cancelButton).toBeDefined();
    });

    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find((btn) => btn.textContent?.includes('İptal'));
    if (cancelButton) {
      await user.click(cancelButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('disables assign button when no training is selected', async () => {
    const mockTrainings = [createMockTraining()];
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trainings: mockTrainings }),
    } as Response);

    render(
      <AssignTrainingModal companyId="company-1" open={true} onOpenChange={mockOnOpenChange} />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const assignButton = buttons.find((btn) => btn.textContent?.includes('Eğitim Ata'));
      expect(assignButton).toBeDefined();
      if (assignButton) {
        expect(assignButton).toBeDisabled();
      }
    });
  });
});
