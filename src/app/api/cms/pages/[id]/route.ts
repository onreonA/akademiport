/**
 * API Route: CMS Page by ID
 * Sprint 23: CMS
 *
 * GET /api/cms/pages/[id] - Get CMS page by ID
 * PUT /api/cms/pages/[id] - Update CMS page
 * DELETE /api/cms/pages/[id] - Delete CMS page (archive)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseCMSPageRepository } from '@/4-infrastructure/database/repositories/SupabaseCMSPageRepository';
import {
  GetPageUseCase,
  UpdatePageUseCase,
  DeletePageUseCase,
} from '@/2-application/use-cases/cms';
import { UpdateCMSPageDto } from '@/3-domain/entities/CMSPage';

/**
 * GET /api/cms/pages/[id]
 * Get CMS page by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is master_admin (for draft/archived pages)
    // Public can access published pages via public route
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const repository = new SupabaseCMSPageRepository();
    const useCase = new GetPageUseCase(repository);
    const result = await useCase.executeById(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 });
    }

    // If page is not published, check if user is master_admin
    if (result.value.status !== 'published' && (!userData || userData.role !== 'master_admin')) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('GET /api/cms/pages/[id] error:', error);
    return NextResponse.json({ error: 'Sayfa getirilemedi' }, { status: 500 });
  }
}

/**
 * PUT /api/cms/pages/[id]
 * Update CMS page
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const dto: UpdateCMSPageDto = {
      slug: body.slug,
      title: body.title,
      content: body.content,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,
      ogImageUrl: body.ogImageUrl,
      ogTitle: body.ogTitle,
      ogDescription: body.ogDescription,
      canonicalUrl: body.canonicalUrl,
      status: body.status,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    };

    const repository = new SupabaseCMSPageRepository();
    const useCase = new UpdatePageUseCase(repository);
    const result = await useCase.execute(id, dto);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('PUT /api/cms/pages/[id] error:', error);
    return NextResponse.json({ error: 'Sayfa güncellenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/cms/pages/[id]
 * Delete CMS page (archive)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const repository = new SupabaseCMSPageRepository();
    const useCase = new DeletePageUseCase(repository);
    const result = await useCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Sayfa arşivlendi',
    });
  } catch (error) {
    console.error('DELETE /api/cms/pages/[id] error:', error);
    return NextResponse.json({ error: 'Sayfa silinemedi' }, { status: 500 });
  }
}
