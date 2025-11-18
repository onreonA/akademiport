/**
 * Supabase CMS Media Repository
 * Sprint 23: CMS
 */

import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import {
  ICMSMediaRepository,
  CMSMediaFilter,
} from '@/3-domain/interfaces/repositories/ICMSMediaRepository';
import { CMSMedia, CreateCMSMediaDto, UpdateCMSMediaDto } from '@/3-domain/entities/CMSMedia';

export class SupabaseCMSMediaRepository implements ICMSMediaRepository {
  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  async create(dto: CreateCMSMediaDto, uploadedBy: string): Promise<Result<CMSMedia>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('cms_media')
        .insert({
          filename: dto.filename,
          original_filename: dto.originalFilename,
          mime_type: dto.mimeType,
          file_size: dto.fileSize,
          file_url: dto.fileUrl,
          storage_path: dto.storagePath,
          alt_text: dto.altText,
          caption: dto.caption,
          uploaded_by: uploadedBy,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Medya oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Medya oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async update(id: string, dto: UpdateCMSMediaDto): Promise<Result<CMSMedia>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: Record<string, any> = {};
      if (dto.altText !== undefined) updateData.alt_text = dto.altText;
      if (dto.caption !== undefined) updateData.caption = dto.caption;

      const { data, error } = await supabase
        .from('cms_media')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Medya güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Medya güncellenemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Get media to delete file from storage
      const mediaResult = await this.findById(id);
      if (mediaResult.isFailure) {
        return Result.fail(mediaResult.error || 'Media bulunamadı');
      }

      const media = mediaResult.value;
      if (!media) {
        return Result.fail('Medya bulunamadı');
      }

      // Delete from database
      const { error: dbError } = await supabase.from('cms_media').delete().eq('id', id);

      if (dbError) {
        return Result.fail(`Medya silinemedi: ${dbError.message}`);
      }

      // Delete file from storage (if Supabase Storage)
      // Note: This requires storage client setup
      // For now, we'll just delete from database
      // TODO: Implement storage file deletion

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        `Medya silinemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async findById(id: string): Promise<Result<CMSMedia | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from('cms_media').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Medya bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(
        `Medya bulunamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async findMany(filter?: CMSMediaFilter): Promise<Result<CMSMedia[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('cms_media').select('*');

      if (filter?.mimeType) {
        if (filter.mimeType.endsWith('/')) {
          // Prefix search (e.g., "image/" for all images)
          query = query.like('mime_type', `${filter.mimeType}%`);
        } else {
          query = query.eq('mime_type', filter.mimeType);
        }
      }

      if (filter?.uploadedBy) {
        query = query.eq('uploaded_by', filter.uploadedBy);
      }

      if (filter?.search) {
        query = query.or(
          `filename.ilike.%${filter.search}%,original_filename.ilike.%${filter.search}%,alt_text.ilike.%${filter.search}%`
        );
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
        return Result.fail(`Medya listesi alınamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(
        `Medya listesi alınamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async findByUploadedBy(uploadedBy: string): Promise<Result<CMSMedia[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('cms_media')
        .select('*')
        .eq('uploaded_by', uploadedBy)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(`Medya listesi alınamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(
        `Medya listesi alınamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async findByMimeType(mimeTypePrefix: string): Promise<Result<CMSMedia[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('cms_media')
        .select('*')
        .like('mime_type', `${mimeTypePrefix}%`)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(`Medya listesi alınamadı: ${error.message}`);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(
        `Medya listesi alınamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async count(filter?: CMSMediaFilter): Promise<Result<number>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('cms_media').select('*', { count: 'exact', head: true });

      if (filter?.mimeType) {
        if (filter.mimeType.endsWith('/')) {
          query = query.like('mime_type', `${filter.mimeType}%`);
        } else {
          query = query.eq('mime_type', filter.mimeType);
        }
      }

      if (filter?.uploadedBy) {
        query = query.eq('uploaded_by', filter.uploadedBy);
      }

      if (filter?.search) {
        query = query.or(
          `filename.ilike.%${filter.search}%,original_filename.ilike.%${filter.search}%,alt_text.ilike.%${filter.search}%`
        );
      }

      const { count, error } = await query;

      if (error) {
        return Result.fail(`Medya sayısı alınamadı: ${error.message}`);
      }

      return Result.ok(count || 0);
    } catch (error) {
      return Result.fail(
        `Medya sayısı alınamadı: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Map database row to entity
   */
  private mapToEntity(row: any): CMSMedia {
    return {
      id: row.id,
      filename: row.filename,
      originalFilename: row.original_filename,
      mimeType: row.mime_type,
      fileSize: row.file_size,
      fileUrl: row.file_url,
      storagePath: row.storage_path,
      altText: row.alt_text,
      caption: row.caption,
      uploadedBy: row.uploaded_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
