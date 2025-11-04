/**
 * Document Viewer Service
 *
 * Provides document viewer functionality for various file types
 * Uses Google Docs Viewer and Office Online Viewer for document preview
 */

export interface DocumentViewerOptions {
  fileUrl: string;
  fileType: string | null;
  fileName: string;
  fileSize: number | null;
}

export interface DocumentViewerResult {
  viewerType: 'iframe' | 'google-docs' | 'office-online' | 'download';
  viewerUrl?: string;
  canPreview: boolean;
  message?: string;
}

export class DocumentViewerService {
  /**
   * Get viewer configuration for a document
   */
  static getViewer(options: DocumentViewerOptions): DocumentViewerResult {
    const { fileUrl, fileType, fileName, fileSize } = options;

    // Get file extension
    const ext = this.getFileExtension(fileName).toLowerCase();

    // PDF files - direct iframe
    if (ext === 'pdf') {
      return {
        viewerType: 'iframe',
        viewerUrl: `${fileUrl}#toolbar=1`,
        canPreview: true,
      };
    }

    // Office documents - check file size and use appropriate viewer
    const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    if (officeExtensions.includes(ext)) {
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB for Office Online
      const googleDocsMaxSizeBytes = 25 * 1024 * 1024; // 25MB for Google Docs

      // File size check
      if (fileSize && fileSize > googleDocsMaxSizeBytes) {
        return {
          viewerType: 'download',
          canPreview: false,
          message: 'Dosya boyutu çok büyük (25MB üzeri). Lütfen indirerek görüntüleyin.',
        };
      }

      // Office Online Viewer (preferred for smaller files, better quality)
      if (fileSize && fileSize <= maxSizeBytes) {
        const encodedUrl = encodeURIComponent(fileUrl);
        return {
          viewerType: 'office-online',
          viewerUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`,
          canPreview: true,
        };
      }

      // Google Docs Viewer (fallback for larger files)
      const encodedUrl = encodeURIComponent(fileUrl);
      return {
        viewerType: 'google-docs',
        viewerUrl: `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`,
        canPreview: true,
      };
    }

    // Image files - direct iframe
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (imageExtensions.includes(ext)) {
      return {
        viewerType: 'iframe',
        viewerUrl: fileUrl,
        canPreview: true,
      };
    }

    // Text files - try Google Docs Viewer
    const textExtensions = ['txt', 'csv', 'rtf'];
    if (textExtensions.includes(ext)) {
      const encodedUrl = encodeURIComponent(fileUrl);
      return {
        viewerType: 'google-docs',
        viewerUrl: `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`,
        canPreview: true,
      };
    }

    // Unsupported file type
    return {
      viewerType: 'download',
      canPreview: false,
      message: 'Bu dosya tipi için önizleme desteklenmiyor. Lütfen indirerek görüntüleyin.',
    };
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }

  /**
   * Check if file type is supported for preview
   */
  static isPreviewSupported(fileName: string, fileType: string | null): boolean {
    const ext = this.getFileExtension(fileName).toLowerCase();

    // Supported extensions
    const supportedExtensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
      'csv',
      'rtf',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
    ];

    return supportedExtensions.includes(ext);
  }

  /**
   * Get file type label for display
   */
  static getFileTypeLabel(fileType: string | null, fileName: string): string {
    if (fileType) {
      if (fileType.includes('pdf')) return 'PDF';
      if (fileType.includes('word')) return 'Word';
      if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel';
      if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PowerPoint';
      if (fileType.includes('text')) return 'Metin';
      if (fileType.includes('image')) return 'Resim';
    }

    const ext = this.getFileExtension(fileName).toUpperCase();
    return ext || 'Dosya';
  }
}
