/**
 * CMS Media Repository Interface
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import { CMSMedia, CreateCMSMediaDto, UpdateCMSMediaDto } from '@/3-domain/entities/CMSMedia';

export interface CMSMediaFilter {
  mimeType?: string; // Filter by MIME type (e.g., "image/", "video/")
  uploadedBy?: string;
  search?: string; // Search in filename, originalFilename, altText
  limit?: number;
  offset?: number;
}

export interface ICMSMediaRepository {
  /**
   * Create a new media record
   */
  create(dto: CreateCMSMediaDto, uploadedBy: string): Promise<Result<CMSMedia>>;

  /**
   * Update media metadata
   */
  update(id: string, dto: UpdateCMSMediaDto): Promise<Result<CMSMedia>>;

  /**
   * Delete media (and file from storage)
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Find media by ID
   */
  findById(id: string): Promise<Result<CMSMedia | null>>;

  /**
   * Find all media with filter
   */
  findMany(filter?: CMSMediaFilter): Promise<Result<CMSMedia[]>>;

  /**
   * Find media by uploadedBy
   */
  findByUploadedBy(uploadedBy: string): Promise<Result<CMSMedia[]>>;

  /**
   * Find media by MIME type
   */
  findByMimeType(mimeTypePrefix: string): Promise<Result<CMSMedia[]>>;

  /**
   * Get total count with filter
   */
  count(filter?: CMSMediaFilter): Promise<Result<number>>;
}
