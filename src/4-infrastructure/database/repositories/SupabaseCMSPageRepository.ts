/**
 * Supabase CMS Page Repository
 * Sprint 23: CMS
 */

import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import {
  ICMSPageRepository,
  CMSPageFilter,
} from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import {
  CMSPage,
  CreateCMSPageDto,
  UpdateCMSPageDto,
  CMSSection,
} from '@/3-domain/entities/CMSPage';

export class SupabaseCMSPageRepository implements ICMSPageRepository {
  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  async create(dto: CreateCMSPageDto, createdBy: string): Promise<Result<CMSPage>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Check if slug exists
      const slugExistsResult = await this.slugExists(dto.slug);
      if (slugExistsResult.isFailure) {
        return Result.fail(slugExistsResult.error || 'Slug kontrolü başarısız');
      }
      if (slugExistsResult.value) {
        return Result.fail(`Slug "${dto.slug}" zaten kullanılıyor`);
      }

      const { data, error } = await supabase
        .from('cms_pages')
        .insert({
          slug: dto.slug,
          title: dto.title,
          content: dto.content || [],
          meta_title: dto.metaTitle,
          meta_description: dto.metaDescription,
          meta_keywords: dto.metaKeywords,
          og_image_url: dto.ogImageUrl,
          og_title: dto.ogTitle,
          og_description: dto.ogDescription,
          canonical_url: dto.canonicalUrl,
          status: dto.status || 'draft',
          published_at: dto.publishedAt?.toISOString(),
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Sayfa oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Sayfa oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async update(id: string, dto: UpdateCMSPageDto): Promise<Result<CMSPage>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Check slug uniqueness if slug is being updated
      if (dto.slug) {
        const slugExistsResult = await this.slugExists(dto.slug, id);
        if (slugExistsResult.isFailure) {
          return Result.fail(slugExistsResult.error || 'Slug kontrolü başarısız');
        }
        if (slugExistsResult.value) {
          return Result.fail(`Slug "${dto.slug}" zaten kullanılıyor`);
        }
      }

      const updateData: Record<string, any> = {};
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.metaTitle !== undefined) updateData.meta_title = dto.metaTitle;
      if (dto.metaDescription !== undefined) updateData.meta_description = dto.metaDescription;
      if (dto.metaKeywords !== undefined) updateData.meta_keywords = dto.metaKeywords;
      if (dto.ogImageUrl !== undefined) updateData.og_image_url = dto.ogImageUrl;
      if (dto.ogTitle !== undefined) updateData.og_title = dto.ogTitle;
      if (dto.ogDescription !== undefined) updateData.og_description = dto.ogDescription;
      if (dto.canonicalUrl !== undefined) updateData.canonical_url = dto.canonicalUrl;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.publishedAt !== undefined) updateData.published_at = dto.publishedAt?.toISOString();

      const { data, error } = await supabase
        .from('cms_pages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Sayfa güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Sayfa güncellenemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Soft delete - archive the page
      const { error } = await supabase
        .from('cms_pages')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) {
        return Result.fail(`Sayfa silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        `Sayfa silinemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async findById(id: string): Promise<Result<CMSPage | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from('cms_pages').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Sayfa bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Sayfa bulunamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async findBySlug(slug: string, includeArchived = false): Promise<Result<CMSPage | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('cms_pages').select('*').eq('slug', slug);

      if (!includeArchived) {
        query = query.neq('status', 'archived');
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Sayfa bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Sayfa bulunamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async findMany(filter?: CMSPageFilter): Promise<Result<CMSPage[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('cms_pages').select('*');

      if (filter?.status) {
        query = query.eq('status', filter.status);
      } else {
        // Exclude archived by default
        query = query.neq('status', 'archived');
      }

      if (filter?.createdBy) {
        query = query.eq('created_by', filter.createdBy);
      }

      if (filter?.search) {
        query = query.or(`title.ilike.%${filter.search}%,slug.ilike.%${filter.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      if (filter?.limit) {
        query = query.limit(filter.limit);
      }

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(`Sayfalar bulunamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(
        `Sayfalar bulunamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async findByStatus(status: 'draft' | 'published' | 'archived'): Promise<Result<CMSPage[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(`Sayfalar bulunamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(
        `Sayfalar bulunamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async slugExists(slug: string, excludeId?: string): Promise<Result<boolean>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('cms_pages')
        .select('id', { count: 'exact', head: true })
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { count, error } = await query;

      if (error) {
        return Result.fail(`Slug kontrolü yapılamadı: ${error.message}`);
      }

      return Result.ok((count || 0) > 0);
    } catch (error) {
      return Result.fail(
        `Slug kontrolü yapılamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async count(filter?: CMSPageFilter): Promise<Result<number>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('cms_pages').select('*', { count: 'exact', head: true });

      if (filter?.status) {
        query = query.eq('status', filter.status);
      } else {
        query = query.neq('status', 'archived');
      }

      if (filter?.createdBy) {
        query = query.eq('created_by', filter.createdBy);
      }

      if (filter?.search) {
        query = query.or(`title.ilike.%${filter.search}%,slug.ilike.%${filter.search}%`);
      }

      const { count, error } = await query;

      if (error) {
        return Result.fail(`Sayfa sayısı alınamadı: ${error.message}`);
      }

      return Result.ok(count || 0);
    } catch (error) {
      return Result.fail(
        `Sayfa sayısı alınamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Map database row to entity
   */
  private mapToEntity(row: any): CMSPage {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      content: (row.content || []) as CMSSection[],
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      metaKeywords: row.meta_keywords || [],
      ogImageUrl: row.og_image_url,
      ogTitle: row.og_title,
      ogDescription: row.og_description,
      canonicalUrl: row.canonical_url,
      status: row.status,
      publishedAt: row.published_at ? new Date(row.published_at) : null,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
