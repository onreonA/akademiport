import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/database/supabase-server';
import { SupabaseNewsRepository } from '@/4-infrastructure/database/repositories/SupabaseNewsRepository';
import { CreateNewsUseCase, GetNewsListUseCase } from '@/2-application/use-cases/news';
import { CreateNewsDto, CreateNewsDtoSchema } from '@/2-application/dtos/news';
import { NewsFilters } from '@/3-domain/interfaces/repositories/INewsRepository';
import { createPaginatedResponse } from '@/5-shared/utils/pagination';
import { applyFieldSelection } from '@/5-shared/utils/field-selection';

/**
 * GET /api/news
 * List news with filters
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
    const filters: NewsFilters = {
      programId: searchParams.get('programId') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      category: searchParams.get('category') as any,
      status: searchParams.get('status') as any,
      isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
      isPinned: searchParams.get('isPinned') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const repository = new SupabaseNewsRepository();
    const useCase = new GetNewsListUseCase(repository);
    const result = await useCase.execute(filters);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    // Apply field selection if requested
    const fieldsParam = searchParams.get('fields');
    const news = fieldsParam
      ? applyFieldSelection(result.value, fieldsParam, {
          defaultFields: ['id', 'title', 'summary', 'category', 'publishedAt'],
          requiredFields: ['id'],
        })
      : result.value;

    // Calculate total for pagination (if repository returns array, use length)
    const total = Array.isArray(news) ? news.length : result.value?.length || 0;
    const newsArray = Array.isArray(news) ? news : result.value || [];

    // Return paginated response
    return NextResponse.json(createPaginatedResponse(newsArray, total, page, limit));
  } catch (error) {
    console.error('GET /api/news error:', error);
    return NextResponse.json({ error: 'Haberler listelenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/news
 * Create new news
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
    const validationResult = CreateNewsDtoSchema.safeParse({
      ...body,
      authorId: user.id,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Geçersiz veri',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const dto: CreateNewsDto = validationResult.data;

    const repository = new SupabaseNewsRepository();
    const useCase = new CreateNewsUseCase(repository);
    const result = await useCase.execute(dto);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('POST /api/news error:', error);
    return NextResponse.json({ error: 'Haber oluşturulamadı' }, { status: 500 });
  }
}
