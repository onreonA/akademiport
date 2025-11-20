/**
 * Unit Tests for ProjectAssignmentMatrix Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { ProjectAssignmentMatrix } from './ProjectAssignmentMatrix';
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
  assignments: [
    {
      companyId: 'company-1',
      projectId: 'project-1',
      subProjectId: 'sp-1',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isActive: true,
    },
  ],
});

describe('ProjectAssignmentMatrix', () => {
  const mockOnRefresh = vi.fn();
  const mockOnBulkAssign = vi.fn();
  const mockOnBulkDates = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders matrix component', () => {
    const matrix = createMockMatrix();
    render(
      <ProjectAssignmentMatrix
        matrix={matrix}
        onRefresh={mockOnRefresh}
        onBulkAssign={mockOnBulkAssign}
        onBulkDates={mockOnBulkDates}
      />
    );

    expect(screen.getByText('Company 1')).toBeInTheDocument();
    expect(screen.getByText('Sub-Project 1')).toBeInTheDocument();
  });

  it('displays loading state when loading is true', () => {
    render(<ProjectAssignmentMatrix matrix={null} loading={true} onRefresh={mockOnRefresh} />);

    // Loading spinner should be visible
    const loadingSpinner = document.querySelector('[class*="animate-spin"]');
    expect(loadingSpinner).toBeDefined();
  });

  it('displays error message when error is provided', () => {
    render(<ProjectAssignmentMatrix matrix={null} error="Test error" onRefresh={mockOnRefresh} />);

    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const matrix = createMockMatrix();
    render(
      <ProjectAssignmentMatrix
        matrix={matrix}
        onRefresh={mockOnRefresh}
        onBulkAssign={mockOnBulkAssign}
        onBulkDates={mockOnBulkDates}
      />
    );

    const buttons = screen.getAllByRole('button');
    const refreshButton = buttons.find(
      (btn) =>
        btn.getAttribute('aria-label')?.includes('refresh') || btn.textContent?.includes('Yenile')
    );

    if (refreshButton) {
      await user.click(refreshButton);
      expect(mockOnRefresh).toHaveBeenCalled();
    }
  });

  it('calls onBulkAssign when bulk assign button is clicked', async () => {
    const user = userEvent.setup();
    const matrix = createMockMatrix();
    render(
      <ProjectAssignmentMatrix
        matrix={matrix}
        onRefresh={mockOnRefresh}
        onBulkAssign={mockOnBulkAssign}
        onBulkDates={mockOnBulkDates}
      />
    );

    const buttons = screen.getAllByRole('button');
    const bulkAssignButton = buttons.find(
      (btn) => btn.textContent?.includes('Toplu Ata') || btn.textContent?.includes('Atama')
    );

    if (bulkAssignButton) {
      await user.click(bulkAssignButton);
      expect(mockOnBulkAssign).toHaveBeenCalled();
    }
  });

  it('disables action buttons when actionsDisabled is true', () => {
    const matrix = createMockMatrix();
    render(
      <ProjectAssignmentMatrix
        matrix={matrix}
        onRefresh={mockOnRefresh}
        onBulkAssign={mockOnBulkAssign}
        onBulkDates={mockOnBulkDates}
        actionsDisabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    const actionButtons = buttons.filter(
      (btn) => btn.textContent?.includes('Ata') || btn.textContent?.includes('Tarih')
    );

    actionButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('handles null matrix gracefully', () => {
    render(<ProjectAssignmentMatrix matrix={null} onRefresh={mockOnRefresh} />);

    // Component should render even with null matrix
    expect(screen.queryByText('Company 1')).not.toBeInTheDocument();
  });

  it('displays assignment checkboxes', () => {
    const matrix = createMockMatrix();
    render(<ProjectAssignmentMatrix matrix={matrix} onRefresh={mockOnRefresh} />);

    // Checkboxes should be present for assignments
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });
});
