/**
 * Unit Tests for TrainingDocumentViewer Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { TrainingDocumentViewer } from './TrainingDocumentViewer';
import type { TrainingDocument } from '@/domain/entities/TrainingDocument';
import userEvent from '@testing-library/user-event';
import { DocumentViewerService } from '@/infrastructure/external/document-viewer.service';

// Mock DocumentViewerService
vi.mock('@/infrastructure/external/document-viewer.service', () => ({
  DocumentViewerService: {
    getViewer: vi.fn(() => ({
      canPreview: true,
      viewerType: 'iframe',
      viewerUrl: 'https://example.com/viewer',
    })),
    getFileTypeLabel: vi.fn(() => 'PDF'),
  },
}));

describe('TrainingDocumentViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(DocumentViewerService.getViewer).mockReturnValue({
      canPreview: true,
      viewerType: 'iframe',
      viewerUrl: 'https://example.com/viewer',
    });
    vi.mocked(DocumentViewerService.getFileTypeLabel).mockReturnValue('PDF');
  });

  const createMockDocument = (overrides?: Partial<TrainingDocument>): TrainingDocument => {
    return {
      id: 'document-1',
      trainingId: 'training-1',
      title: 'Test Document',
      description: 'Test document description',
      fileName: 'test.pdf',
      fileUrl: 'https://example.com/test.pdf',
      fileType: 'application/pdf',
      fileSize: 1024000,
      orderIndex: 1,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('renders document viewer with title', () => {
    const document = createMockDocument();
    render(<TrainingDocumentViewer document={document} />);

    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('displays document description when provided', () => {
    const document = createMockDocument({ description: 'Document description' });
    render(<TrainingDocumentViewer document={document} />);

    expect(screen.getByText('Document description')).toBeInTheDocument();
  });

  it('shows locked badge when document is locked', () => {
    const document = createMockDocument({ isLocked: false });
    render(<TrainingDocumentViewer document={document} isLocked={true} />);

    expect(screen.getByText('Kilitli')).toBeInTheDocument();
  });

  it('shows completed badge when document is read', () => {
    const document = createMockDocument();
    render(
      <TrainingDocumentViewer
        document={document}
        progress={100}
        readAt={new Date()}
        isLocked={false}
      />
    );

    expect(screen.getByText('Okundu')).toBeInTheDocument();
  });

  it('displays file name', () => {
    const document = createMockDocument({ fileName: 'test.pdf' });
    render(<TrainingDocumentViewer document={document} isLocked={false} />);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('displays file type label', () => {
    const document = createMockDocument();
    render(<TrainingDocumentViewer document={document} isLocked={false} />);

    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('shows download and view buttons when document is not locked', () => {
    const document = createMockDocument();
    render(<TrainingDocumentViewer document={document} isLocked={false} />);

    const buttons = screen.getAllByRole('button');
    const downloadButton = buttons.find((btn) => btn.textContent?.includes('İndir'));
    const viewButton = buttons.find((btn) => btn.textContent?.includes('Görüntüle'));

    expect(downloadButton).toBeInTheDocument();
    expect(viewButton).toBeInTheDocument();
  });

  it('shows mark as read button when document is not read and progress is less than 100', () => {
    const document = createMockDocument();
    render(
      <TrainingDocumentViewer document={document} isLocked={false} progress={0} readAt={null} />
    );

    // Button should be present when conditions are met
    const buttons = screen.getAllByRole('button');
    const markAsReadButton = buttons.find((btn) => btn.textContent?.includes('Okundu İşaretle'));
    expect(markAsReadButton).toBeDefined();
  });

  it('handles missing description gracefully', () => {
    const document = createMockDocument({ description: null });
    render(<TrainingDocumentViewer document={document} />);

    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('handles missing file size gracefully', () => {
    const document = createMockDocument({ fileSize: null });
    render(<TrainingDocumentViewer document={document} />);

    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });
});
