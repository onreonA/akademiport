import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { CreateTopicUseCase, ListTopicsUseCase } from '@/2-application/use-cases/forum';
import { CreateTopicDto, CreateTopicDtoSchema, TopicFilterDto } from '@/2-application/dtos/forum';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { parsePaginationParams, createPaginatedResponse } from '@/5-shared/utils/pagination';
import { applyFieldSelection } from '@/5-shared/utils/field-selection';

/**
 * GET /api/forum/topics
 * List topics with filters
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

    // Get user's company and program
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı' }, { status: 404 });
    }

    // Get program_id from company if user has a company
    let programId: string | undefined;
    if (userData.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('program_id')
        .eq('id', userData.company_id)
        .single();

      programId = companyData?.program_id;
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const isAdmin = userData.role === 'master_admin';

    // Company users için RLS politikası kendi konularını da gösterir
    // Bu yüzden isApproved filtresini undefined yapıyoruz
    const userRole = userData.role;
    const defaultIsApproved = undefined; // RLS politikası zaten yönetiyor

    // Parse pagination parameters
    const { page, limit } = parsePaginationParams(searchParams, {
      page: 1,
      limit: 20,
      maxLimit: 100,
    });

    // For admin, if no programId in query params, don't filter by programId (show all)
    // For other users, use their company's programId
    const queryProgramId = searchParams.get('programId');
    const finalProgramId = isAdmin
      ? queryProgramId || undefined // Admin: use query param or undefined (all programs)
      : queryProgramId || programId; // Others: use query param or their program

    const filters: TopicFilterDto = {
      programId: finalProgramId,
      categoryId: searchParams.get('categoryId') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      status: searchParams.get('status') as any,
      priority: searchParams.get('priority') as any,
      isPinned: searchParams.get('isPinned') === 'true' ? true : undefined,
      isLocked: searchParams.get('isLocked') === 'true' ? true : undefined,
      isApproved:
        searchParams.get('isApproved') === 'true'
          ? true
          : searchParams.get('isApproved') === 'false'
            ? false
            : defaultIsApproved,
      search: searchParams.get('search') || undefined,
      page,
      limit,
      sortBy: (searchParams.get('sortBy') as any) || 'lastReplyAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    console.log('Forum topics filters:', {
      isAdmin,
      queryProgramId,
      finalProgramId,
      programId,
      filters,
      userRole,
    });

    const repository = new SupabaseForumRepository();
    const useCase = new ListTopicsUseCase(repository);
    const result = await useCase.execute(filters);

    if (result.isFailure) {
      console.error('ListTopicsUseCase error:', result.error);
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    console.log('Forum topics result:', {
      topicsCount: result.value?.topics?.length || 0,
      total: result.value?.total || 0,
    });

    // Apply field selection if requested
    const fieldsParam = searchParams.get('fields');
    const topics = fieldsParam
      ? applyFieldSelection(result.value.topics, fieldsParam, {
          defaultFields: ['id', 'title', 'slug', 'status', 'createdAt'],
          requiredFields: ['id'],
        })
      : result.value.topics;

    // Return paginated response
    return NextResponse.json(createPaginatedResponse(topics, result.value.total, page, limit));
  } catch (error) {
    console.error('GET /api/forum/topics error:', error);
    return NextResponse.json({ error: 'Konular listelenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/forum/topics
 * Create new topic
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

    // Get user's role and company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Kullanıcı bilgisi bulunamadı' }, { status: 404 });
    }

    const isAdmin = userData.role === 'master_admin';
    const body = await request.json();

    // For admin, programId comes from request body
    // For other users, programId comes from their company
    let programId: string;
    let companyId: string | null;

    if (isAdmin) {
      programId = body.programId || '';
      companyId = null; // Admin doesn't have a company
    } else {
      if (!userData.company_id) {
        return NextResponse.json({ error: 'Firma bilgisi bulunamadı' }, { status: 404 });
      }

      // Get company's program_id
      const { data: companyData } = await supabase
        .from('companies')
        .select('program_id')
        .eq('id', userData.company_id)
        .single();

      if (!companyData?.program_id) {
        return NextResponse.json({ error: 'Program bilgisi bulunamadı' }, { status: 404 });
      }

      programId = companyData.program_id || body.programId || '';
      companyId = userData.company_id;
    }

    // Validate request body
    const validationResult = CreateTopicDtoSchema.safeParse({
      programId,
      categoryId: body.categoryId,
      title: body.title,
      content: body.content,
      priority: body.priority,
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

    const dto: CreateTopicDto = validationResult.data;

    const repository = new SupabaseForumRepository();
    const leaderboardRepository = new SupabaseLeaderboardRepository();
    const companyRepository = new CompanyRepository();
    const addLeaderboardScore = new AddLeaderboardScoreUseCase(
      leaderboardRepository,
      companyRepository
    );
    const useCase = new CreateTopicUseCase(repository, addLeaderboardScore);
    // For admin, companyId is null, but use case expects a string
    // We need to handle this case - admin topics should not have companyId
    if (!companyId && !isAdmin) {
      return NextResponse.json({ error: 'Firma bilgisi gereklidir' }, { status: 400 });
    }
    // Pass empty string for admin (will be handled in use case)
    const result = await useCase.execute(dto, user.id, companyId || '');

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('POST /api/forum/topics error:', error);
    return NextResponse.json({ error: 'Konu oluşturulamadı' }, { status: 500 });
  }
}
