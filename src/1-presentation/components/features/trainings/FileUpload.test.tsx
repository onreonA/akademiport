/**
 * Unit Tests for FileUpload Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/shared/test/utils';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './FileUpload';

// Mock fetch
global.fetch = vi.fn();

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FileUpload', () => {
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockClear();
  });

  it('renders file upload component', () => {
    render(<FileUpload onUploadComplete={mockOnUploadComplete} />);

    expect(screen.getByText(/dosya yüklemek için tıklayın/i)).toBeInTheDocument();
  });

  it('displays max file size and accepted formats', () => {
    render(<FileUpload maxSize={10 * 1024 * 1024} accept=".pdf,.doc" />);

    expect(screen.getByText(/maksimum/i)).toBeInTheDocument();
    expect(screen.getByText(/\.pdf,\.doc/i)).toBeInTheDocument();
  });

  it('shows upload button when no file is uploaded', () => {
    render(<FileUpload onUploadComplete={mockOnUploadComplete} />);

    expect(screen.getByText(/dosya yüklemek için tıklayın/i)).toBeInTheDocument();
  });

  it('calls onUploadComplete when file upload succeeds', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://example.com/test.pdf' }),
    } as Response);

    const { container } = render(<FileUpload onUploadComplete={mockOnUploadComplete} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    if (fileInput) {
      await user.upload(fileInput, mockFile);

      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      await waitFor(
        () => {
          expect(mockOnUploadComplete).toHaveBeenCalledWith(
            'https://example.com/test.pdf',
            'test.pdf',
            expect.any(Number),
            'application/pdf'
          );
        },
        { timeout: 3000 }
      );
    }
  });

  it('shows error when file size exceeds max size', async () => {
    const user = userEvent.setup();
    // Create a file that exceeds max size (using Blob for large files)
    const largeFile = new File(['x'.repeat(60 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    const { container } = render(
      <FileUpload maxSize={50 * 1024 * 1024} onUploadError={mockOnUploadError} />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      await user.upload(fileInput, largeFile);

      await waitFor(
        () => {
          expect(mockOnUploadError).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    }
  });

  it('shows error when file type is not accepted', async () => {
    const user = userEvent.setup();
    // Use a file extension that's definitely not in the accept list
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });

    const { container } = render(
      <FileUpload accept=".pdf,.doc" onUploadError={mockOnUploadError} />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      // Simulate file selection - the browser's accept attribute might prevent selection,
      // so we need to manually trigger the change event
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(
        () => {
          expect(mockOnUploadError).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    }
  });

  it('disables upload when disabled prop is true', () => {
    const { container } = render(<FileUpload disabled={true} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDisabled();
  });

  it('displays uploaded file information', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://example.com/test.pdf' }),
    } as Response);

    const { container } = render(<FileUpload onUploadComplete={mockOnUploadComplete} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      await user.upload(fileInput, mockFile);

      await waitFor(
        () => {
          expect(screen.getByText('test.pdf')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    }
  });

  it('allows removing uploaded file', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://example.com/test.pdf' }),
    } as Response);

    const { container } = render(<FileUpload onUploadComplete={mockOnUploadComplete} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      await user.upload(fileInput, mockFile);

      await waitFor(
        () => {
          expect(screen.getByText('test.pdf')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const removeButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('svg') || btn.textContent?.includes('X'));

      if (removeButton) {
        await user.click(removeButton);

        await waitFor(() => {
          expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
        });
      }
    }
  });
});
