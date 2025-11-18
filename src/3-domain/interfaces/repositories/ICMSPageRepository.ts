/**
 * CMS Page Repository Interface
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import {
  CMSPage,
  CreateCMSPageDto,
  UpdateCMSPageDto,
  CMSPageStatus,
} from '@/3-domain/entities/CMSPage';

export interface CMSPageFilter {
  status?: CMSPageStatus;
  search?: string; // Search in title and slug
  createdBy?: string;
  limit?: number;
  offset?: number;
}

export interface ICMSPageRepository {
  /**
   * Create a new CMS page
   */
  create(dto: CreateCMSPageDto, createdBy: string): Promise<Result<CMSPage>>;

  /**
   * Update a CMS page
   */
  update(id: string, dto: UpdateCMSPageDto): Promise<Result<CMSPage>>;

  /**
   * Delete a CMS page (soft delete - archive)
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Find page by ID
   */
  findById(id: string): Promise<Result<CMSPage | null>>;

  /**
   * Find page by slug
   */
  findBySlug(slug: string, includeArchived?: boolean): Promise<Result<CMSPage | null>>;

  /**
   * Find all pages with filter
   */
  findMany(filter?: CMSPageFilter): Promise<Result<CMSPage[]>>;

  /**
   * Find pages by status
   */
  findByStatus(status: CMSPageStatus): Promise<Result<CMSPage[]>>;

  /**
   * Check if slug exists
   */
  slugExists(slug: string, excludeId?: string): Promise<Result<boolean>>;

  /**
   * Get total count with filter
   */
  count(filter?: CMSPageFilter): Promise<Result<number>>;
}
