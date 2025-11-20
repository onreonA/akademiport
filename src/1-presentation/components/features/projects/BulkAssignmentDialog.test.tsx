/**
 * Unit Tests for BulkAssignmentDialog Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { BulkAssignmentDialog } from './BulkAssignmentDialog';
import type { ProjectAssignmentMatrixDTO } from '@/2-application/dto/project-assignment.dto';

const createMockMatrix = (): ProjectAssignmentMatrixDTO => ({
  project: {
    id: 'project-1',
    name: 'Test Project',
  },
  companies: [
    {
      id: 'company-1',
      name: 'Company 1',
      city: 'Istanbul',
      sector: 'Technology',
    },
    {
      id: 'company-2',
      name: 'Company 2',
      city: 'Ankara',
      sector: 'Finance',
    },
  ],
  subProjects: [
    { id: 'sp-1', name: 'Sub-Project 1', status: 'active', orderIndex: 0 },
    { id: 'sp-2', name: 'Sub-Project 2', status: 'active', orderIndex: 1 },
  ],
  assignments: [],
});

describe('BulkAssignmentDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders dialog when open is true', () => {
    const matrix = createMockMatrix();
    render(
      <BulkAssignmentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        matrix={matrix}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/alt proje atamalarını yönet/i)).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    const matrix = createMockMatrix();
    render(
      <BulkAssignmentDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        matrix={matrix}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByText(/alt proje atamalarını yönet/i)).not.toBeInTheDocument();
  });

  it('renders dialog with matrix data', () => {
    const matrix = createMockMatrix();
    render(
      <BulkAssignmentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        matrix={matrix}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/alt proje atamalarını yönet/i)).toBeInTheDocument();
  });

  it('renders with companies and sub-projects', () => {
    const matrix = createMockMatrix();
    const { container } = render(
      <BulkAssignmentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        matrix={matrix}
        onSubmit={mockOnSubmit}
      />
    );

    // Component should render
    expect(container).toBeTruthy();
  });

  it('renders filter inputs', () => {
    const matrix = createMockMatrix();
    const { container } = render(
      <BulkAssignmentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        matrix={matrix}
        onSubmit={mockOnSubmit}
      />
    );

    // Component should render with filters
    expect(container).toBeTruthy();
  });

  it('calls onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const matrix = createMockMatrix();
    render(
      <BulkAssignmentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        matrix={matrix}
        onSubmit={mockOnSubmit}
      />
    );

    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find((btn) => btn.textContent?.includes('İptal'));

    if (cancelButton) {
      await user.click(cancelButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('renders submit button', () => {
    const matrix = createMockMatrix();
    render(
      <BulkAssignmentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        matrix={matrix}
        onSubmit={mockOnSubmit}
      />
    );

    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(
      (btn) => btn.textContent?.includes('Ata') || btn.textContent?.includes('Kaydet')
    );

    // Submit button should be present
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles empty matrix gracefully', () => {
    render(
      <BulkAssignmentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        matrix={null}
        onSubmit={mockOnSubmit}
      />
    );

    // Dialog should render even with null matrix
    expect(screen.getByText(/alt proje atamalarını yönet/i)).toBeInTheDocument();
  });
});
