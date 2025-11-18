/**
 * API Route: CMS Media
 * Sprint 23: CMS
 *
 * GET /api/cms/media - List CMS media
 * POST /api/cms/media - Upload media
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseCMSMediaRepository } from '@/4-infrastructure/database/repositories/SupabaseCMSMediaRepository';
import { UploadMediaUseCase } from '@/2-application/use-cases/cms';
import { CMSMediaFilter } from '@/3-domain/interfaces/repositories/ICMSMediaRepository';

/**
 * GET /api/cms/media
 * List CMS media with filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const filter: CMSMediaFilter = {
      mimeType: searchParams.get('mimeType') || undefined,
      uploadedBy: searchParams.get('uploadedBy') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const repository = new SupabaseCMSMediaRepository();
    const result = await repository.findMany(filter);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('GET /api/cms/media error:', error);
    return NextResponse.json({ error: 'Medya listesi alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/cms/media
 * Upload media
 * Note: File upload should be handled via FormData
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is master_admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();

    // TODO: Implement actual file upload to Supabase Storage
    // For now, we expect the file to be uploaded separately and URL provided
    const uploadRequest = {
      filename: body.filename,
      originalFilename: body.originalFilename,
      mimeType: body.mimeType,
      fileSize: body.fileSize,
      fileUrl: body.fileUrl,
      storagePath: body.storagePath,
      altText: body.altText,
      caption: body.caption,
    };

    const repository = new SupabaseCMSMediaRepository();
    const useCase = new UploadMediaUseCase(repository);
    const result = await useCase.execute(uploadRequest, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/cms/media error:', error);
    return NextResponse.json({ error: 'Medya yüklenemedi' }, { status: 500 });
  }
}
