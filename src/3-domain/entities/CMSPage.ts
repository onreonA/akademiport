/**
 * CMS Page Entity
 * Sprint 23: CMS
 */

export type CMSPageStatus = 'draft' | 'published' | 'archived';

export type CMSSectionType =
  | 'hero'
  | 'text'
  | 'image'
  | 'features'
  | 'testimonials'
  | 'cta'
  | 'stats'
  | 'gallery'
  | 'video'
  | 'form'
  | 'faq'
  | 'pricing'
  | 'team'
  | 'contact'
  | 'map'
  | 'custom';

export interface CMSSection {
  id?: string;
  pageId?: string;
  type: CMSSectionType;
  orderIndex: number;
  content: Record<string, any>; // Type'a göre değişir
  settings: Record<string, any>; // Background, padding, colors, etc.
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: CMSSection[]; // Sections array
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  ogImageUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
  status: CMSPageStatus;
  publishedAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCMSPageDto {
  slug: string;
  title: string;
  content?: CMSSection[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImageUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  status?: CMSPageStatus;
  publishedAt?: Date;
}

export interface UpdateCMSPageDto {
  slug?: string;
  title?: string;
  content?: CMSSection[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImageUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  status?: CMSPageStatus;
  publishedAt?: Date;
}

export class CMSPageEntity {
  constructor(private page: CMSPage) {}

  get id(): string {
    return this.page.id;
  }

  get slug(): string {
    return this.page.slug;
  }

  get title(): string {
    return this.page.title;
  }

  get status(): CMSPageStatus {
    return this.page.status;
  }

  get isPublished(): boolean {
    return this.page.status === 'published';
  }

  get isDraft(): boolean {
    return this.page.status === 'draft';
  }

  get isArchived(): boolean {
    return this.page.status === 'archived';
  }

  /**
   * Slug validation
   */
  validateSlug(): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(this.page.slug);
  }

  /**
   * SEO meta title validation (max 60 characters recommended)
   */
  validateMetaTitle(): boolean {
    if (!this.page.metaTitle) return true;
    return this.page.metaTitle.length <= 60;
  }

  /**
   * SEO meta description validation (max 160 characters recommended)
   */
  validateMetaDescription(): boolean {
    if (!this.page.metaDescription) return true;
    return this.page.metaDescription.length <= 160;
  }

  /**
   * Publish page
   */
  publish(): void {
    if (this.page.status === 'draft') {
      this.page.status = 'published';
      this.page.publishedAt = new Date();
    }
  }

  /**
   * Archive page
   */
  archive(): void {
    if (this.page.status === 'published') {
      this.page.status = 'archived';
    }
  }

  /**
   * Unarchive page (back to draft)
   */
  unarchive(): void {
    if (this.page.status === 'archived') {
      this.page.status = 'draft';
    }
  }

  /**
   * Get active sections
   */
  getActiveSections(): CMSSection[] {
    return this.page.content
      .filter((section) => section.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  /**
   * Get section by type
   */
  getSectionsByType(type: CMSSectionType): CMSSection[] {
    return this.page.content.filter((section) => section.type === type && section.isActive);
  }

  /**
   * To plain object
   */
  toJSON(): CMSPage {
    return { ...this.page };
  }
}
