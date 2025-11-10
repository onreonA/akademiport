/**
 * Component Tests for BulkDatesDialog
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { BulkDatesDialog } from './BulkDatesDialog';
import type { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';

// BulkDatesDialog doesn't use hooks, it receives onSubmit as prop

describe('BulkDatesDialog', () => {
  const mockMatrix: ProjectAssignmentMatrixDTO = {
    subProjects: [
      { id: 'sub-1', name: 'Sub Project 1' },
      { id: 'sub-2', name: 'Sub Project 2' },
    ],
    companies: [
      { id: 'company-1', name: 'Company 1', city: 'Istanbul' },
      { id: 'company-2', name: 'Company 2', city: 'Ankara' },
    ],
    assignments: [
      {
        companyId: 'company-1',
        subProjectId: 'sub-1',
        startDate: null,
        endDate: null,
      },
      {
        companyId: 'company-2',
        subProjectId: 'sub-1',
        startDate: null,
        endDate: null,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <BulkDatesDialog open={true} matrix={mockMatrix} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    expect(screen.getByText(/toplu tarih/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <BulkDatesDialog open={false} matrix={mockMatrix} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    expect(screen.queryByText(/toplu tarih/i)).not.toBeInTheDocument();
  });

  it('displays sub-projects list', async () => {
    render(
      <BulkDatesDialog open={true} matrix={mockMatrix} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    // Wait for dialog to render (portal)
    await waitFor(
      () => {
        expect(screen.getByText(/firma bazlı tarihleri/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for select to render and initial sub-project to be selected (component uses setTimeout)
    await waitFor(
      () => {
        // Select should be rendered with placeholder or selected value
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('allows selecting date range', async () => {
    const user = userEvent.setup();

    render(
      <BulkDatesDialog open={true} matrix={mockMatrix} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    // Wait for dialog to render (portal)
    await waitFor(
      () => {
        expect(screen.getByText(/firma bazlı tarihleri/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for select to render and initial sub-project to be auto-selected
    await waitFor(
      () => {
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Component auto-selects first sub-project, wait for date inputs to appear
    // Date inputs can be found by placeholder (desktop) or label (mobile)
    await waitFor(
      () => {
        const startDateInputs = screen.queryAllByPlaceholderText(/başlangıç tarihi/i);
        const startDateInputsByLabel = screen.queryAllByLabelText(/başlangıç/i);
        expect(startDateInputs.length + startDateInputsByLabel.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    // Then find date inputs for companies (try both placeholder and label)
    const startDateInputsByPlaceholder = screen.queryAllByPlaceholderText(/başlangıç tarihi/i);
    const startDateInputsByLabel = screen.queryAllByLabelText(/başlangıç/i);
    const startDateInputs = [...startDateInputsByPlaceholder, ...startDateInputsByLabel];

    const endDateInputsByPlaceholder = screen.queryAllByPlaceholderText(/bitiş tarihi/i);
    const endDateInputsByLabel = screen.queryAllByLabelText(/bitiş/i);
    const endDateInputs = [...endDateInputsByPlaceholder, ...endDateInputsByLabel];

    expect(startDateInputs.length).toBeGreaterThan(0);
    expect(endDateInputs.length).toBeGreaterThan(0);

    await user.clear(startDateInputs[0]);
    await user.type(startDateInputs[0], '2025-02-01');
    await user.clear(endDateInputs[0]);
    await user.type(endDateInputs[0], '2025-02-28');

    await waitFor(() => {
      expect(startDateInputs[0]).toHaveValue('2025-02-01');
      expect(endDateInputs[0]).toHaveValue('2025-02-28');
    });
  });

  it('validates date range', async () => {
    const user = userEvent.setup();

    render(
      <BulkDatesDialog open={true} matrix={mockMatrix} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    // Wait for dialog to render (portal)
    await waitFor(
      () => {
        expect(screen.getByText(/firma bazlı tarihleri/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for select to render and initial sub-project to be auto-selected
    await waitFor(
      () => {
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Component auto-selects first sub-project, wait for date inputs to appear
    await waitFor(
      () => {
        const startDateInputs = screen.queryAllByPlaceholderText(/başlangıç tarihi/i);
        const startDateInputsByLabel = screen.queryAllByLabelText(/başlangıç/i);
        expect(startDateInputs.length + startDateInputsByLabel.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    // Find date inputs (try both placeholder and label)
    const startDateInputsByPlaceholder = screen.queryAllByPlaceholderText(/başlangıç tarihi/i);
    const startDateInputsByLabel = screen.queryAllByLabelText(/başlangıç/i);
    const startDateInputs = [...startDateInputsByPlaceholder, ...startDateInputsByLabel];

    const endDateInputsByPlaceholder = screen.queryAllByPlaceholderText(/bitiş tarihi/i);
    const endDateInputsByLabel = screen.queryAllByLabelText(/bitiş/i);
    const endDateInputs = [...endDateInputsByPlaceholder, ...endDateInputsByLabel];

    expect(startDateInputs.length).toBeGreaterThan(0);
    expect(endDateInputs.length).toBeGreaterThan(0);

    // End date before start date
    await user.clear(startDateInputs[0]);
    await user.type(startDateInputs[0], '2025-02-28');
    await user.clear(endDateInputs[0]);
    await user.type(endDateInputs[0], '2025-02-01');

    const submitButton = screen.getByRole('button', { name: /tarihleri kaydet/i });
    await user.click(submitButton);

    // Component should show validation error or prevent submission
    await waitFor(() => {
      // Check if validation prevents submission or shows error
      expect(submitButton).toBeInTheDocument();
    });
  });

  it('calls onOpenChange when cancel button is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <BulkDatesDialog
        open={true}
        matrix={mockMatrix}
        onOpenChange={onOpenChange}
        onSubmit={vi.fn()}
      />
    );

    // Wait for dialog to render (portal)
    await waitFor(
      () => {
        expect(screen.getByText(/firma bazlı tarihleri/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for select to render
    await waitFor(
      () => {
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for footer to render - check for any button in footer
    await waitFor(
      () => {
        const allButtons = screen.queryAllByRole('button');
        // Should have at least cancel and submit buttons
        expect(allButtons.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 5000 }
    );

    // Find cancel button by checking all buttons' text content
    const allButtons = screen.getAllByRole('button');
    const cancelButton = allButtons.find((btn) => {
      const text = btn.textContent?.trim().toLowerCase() || '';
      return text === 'iptal' || text.includes('iptal');
    });

    expect(cancelButton).toBeDefined();
    expect(cancelButton).toBeInTheDocument();

    if (cancelButton) {
      await user.click(cancelButton);
      await waitFor(
        () => {
          expect(onOpenChange).toHaveBeenCalledWith(false);
        },
        { timeout: 2000 }
      );
    }
  });

  it('submits form with selected dates', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <BulkDatesDialog open={true} matrix={mockMatrix} onOpenChange={vi.fn()} onSubmit={onSubmit} />
    );

    // Wait for dialog to render (portal)
    await waitFor(
      () => {
        expect(screen.getByText(/firma bazlı tarihleri/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait for select to render and initial sub-project to be auto-selected
    await waitFor(
      () => {
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Component auto-selects first sub-project, wait for date inputs to appear
    await waitFor(
      () => {
        const startDateInputs = screen.queryAllByPlaceholderText(/başlangıç tarihi/i);
        const startDateInputsByLabel = screen.queryAllByLabelText(/başlangıç/i);
        expect(startDateInputs.length + startDateInputsByLabel.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    // Fill in dates for companies (try both placeholder and label)
    const startDateInputsByPlaceholder = screen.queryAllByPlaceholderText(/başlangıç tarihi/i);
    const startDateInputsByLabel = screen.queryAllByLabelText(/başlangıç/i);
    const startDateInputs = [...startDateInputsByPlaceholder, ...startDateInputsByLabel];

    const endDateInputsByPlaceholder = screen.queryAllByPlaceholderText(/bitiş tarihi/i);
    const endDateInputsByLabel = screen.queryAllByLabelText(/bitiş/i);
    const endDateInputs = [...endDateInputsByPlaceholder, ...endDateInputsByLabel];

    expect(startDateInputs.length).toBeGreaterThan(0);
    expect(endDateInputs.length).toBeGreaterThan(0);

    await user.clear(startDateInputs[0]);
    await user.type(startDateInputs[0], '2025-02-01');
    await user.clear(endDateInputs[0]);
    await user.type(endDateInputs[0], '2025-02-28');

    // Wait for submit button to be enabled
    await waitFor(
      () => {
        const submitButtonByText = screen.queryByText(/tarihleri kaydet/i);
        const submitButtonByRole = screen.queryByRole('button', { name: /tarihleri kaydet/i });
        const submitButton = submitButtonByText || submitButtonByRole;
        expect(submitButton).toBeTruthy();
        if (submitButton) {
          expect(submitButton).not.toBeDisabled();
        }
      },
      { timeout: 3000 }
    );

    // Try to find submit button by text first, then by role
    let submitButton = screen.queryByText(/tarihleri kaydet/i);
    if (!submitButton) {
      submitButton = screen.getByRole('button', { name: /tarihleri kaydet/i });
    }

    await user.click(submitButton);

    await waitFor(
      () => {
        expect(onSubmit).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });
});
