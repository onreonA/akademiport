/**
 * CMS Media Entity
 * Sprint 23: CMS
 */

export interface CMSMedia {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number; // bytes
  fileUrl: string; // Supabase Storage URL
  storagePath: string; // Storage bucket path
  altText?: string | null;
  caption?: string | null;
  uploadedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCMSMediaDto {
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  storagePath: string;
  altText?: string;
  caption?: string;
}

export interface UpdateCMSMediaDto {
  altText?: string;
  caption?: string;
}

export class CMSMediaEntity {
  constructor(private media: CMSMedia) {}

  get id(): string {
    return this.media.id;
  }

  get filename(): string {
    return this.media.filename;
  }

  get fileUrl(): string {
    return this.media.fileUrl;
  }

  get mimeType(): string {
    return this.media.mimeType;
  }

  get fileSize(): number {
    return this.media.fileSize;
  }

  /**
   * Check if media is an image
   */
  get isImage(): boolean {
    return this.media.mimeType.startsWith('image/');
  }

  /**
   * Check if media is a video
   */
  get isVideo(): boolean {
    return this.media.mimeType.startsWith('video/');
  }

  /**
   * Check if media is a document
   */
  get isDocument(): boolean {
    return (
      this.media.mimeType.includes('pdf') ||
      this.media.mimeType.includes('word') ||
      this.media.mimeType.includes('excel') ||
      this.media.mimeType.includes('text')
    );
  }

  /**
   * Get file size in human readable format
   */
  getFileSizeHumanReadable(): string {
    const bytes = this.media.fileSize;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  getFileExtension(): string {
    return this.media.filename.split('.').pop() || '';
  }

  /**
   * To plain object
   */
  toJSON(): CMSMedia {
    return { ...this.media };
  }
}
