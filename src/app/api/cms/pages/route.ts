/**
 * API Route: CMS Pages
 * Sprint 23: CMS
 *
 * GET /api/cms/pages - List CMS pages
 * POST /api/cms/pages - Create new CMS page
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseCMSPageRepository } from '@/4-infrastructure/database/repositories/SupabaseCMSPageRepository';
import { CreatePageUseCase, GetPagesUseCase } from '@/2-application/use-cases/cms';
import { CreateCMSPageDto } from '@/3-domain/entities/CMSPage';
import { CMSPageFilter } from '@/3-domain/interfaces/repositories/ICMSPageRepository';

/**
 * GET /api/cms/pages
 * List CMS pages with filters
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

    // Check if user is master_admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const filter: CMSPageFilter = {
      status: searchParams.get('status') as any,
      search: searchParams.get('search') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const repository = new SupabaseCMSPageRepository();
    const useCase = new GetPagesUseCase(repository);
    const result = await useCase.execute(filter);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('GET /api/cms/pages error:', error);
    return NextResponse.json({ error: 'Sayfalar listelenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/cms/pages
 * Create new CMS page
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
    const dto: CreateCMSPageDto = {
      slug: body.slug,
      title: body.title,
      content: body.content || [],
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,
      ogImageUrl: body.ogImageUrl,
      ogTitle: body.ogTitle,
      ogDescription: body.ogDescription,
      canonicalUrl: body.canonicalUrl,
      status: body.status || 'draft',
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    };

    const repository = new SupabaseCMSPageRepository();
    const useCase = new CreatePageUseCase(repository);
    const result = await useCase.execute(dto, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/cms/pages error:', error);
    return NextResponse.json({ error: 'Sayfa oluşturulamadı' }, { status: 500 });
  }
}
