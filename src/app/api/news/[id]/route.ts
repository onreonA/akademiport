import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/database/supabase-server';
import { SupabaseNewsRepository } from '@/4-infrastructure/database/repositories/SupabaseNewsRepository';
import { UpdateNewsUseCase } from '@/2-application/use-cases/news';
import { UpdateNewsDto, UpdateNewsDtoSchema } from '@/2-application/dtos/news';

/**
 * GET /api/news/[id]
 * Get single news by ID
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

    const repository = new SupabaseNewsRepository();
    const result = await repository.findById(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
    }

    // Get tags
    const tagsResult = await repository.getNewsTags(id);
    const tags = tagsResult.isSuccess ? tagsResult.value : [];

    return NextResponse.json({ ...result.value, tags });
  } catch (error) {
    console.error('GET /api/news/[id] error:', error);
    return NextResponse.json({ error: 'Haber getirilemedi' }, { status: 500 });
  }
}

/**
 * PUT /api/news/[id]
 * Update news
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

    // Check if user is admin or consultant
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['master_admin', 'consultant'].includes(userData.role)) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = UpdateNewsDtoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Geçersiz veri',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const dto: UpdateNewsDto = validationResult.data;

    const repository = new SupabaseNewsRepository();
    const useCase = new UpdateNewsUseCase(repository);
    const result = await useCase.execute(id, dto, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('PUT /api/news/[id] error:', error);
    return NextResponse.json({ error: 'Haber güncellenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/news/[id]
 * Delete news
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

    // Check if user is admin or consultant
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['master_admin', 'consultant'].includes(userData.role)) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const repository = new SupabaseNewsRepository();
    const result = await repository.delete(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Haber silindi' });
  } catch (error) {
    console.error('DELETE /api/news/[id] error:', error);
    return NextResponse.json({ error: 'Haber silinemedi' }, { status: 500 });
  }
}
