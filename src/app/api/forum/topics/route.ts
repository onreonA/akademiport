import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { CreateTopicUseCase, ListTopicsUseCase } from '@/2-application/use-cases/forum';
import { CreateTopicDto, TopicFilterDto } from '@/2-application/dtos/forum';

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
      .select('company_id, role, companies!inner(program_id)')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı' }, { status: 404 });
    }

    const programId = userData.companies?.program_id;

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    
    // Company users için sadece onaylanmış konuları göster
    const userRole = userData.role;
    const defaultIsApproved = (userRole === 'company_user' || userRole === 'company_admin') ? true : undefined;
    
    const filters: TopicFilterDto = {
      programId: searchParams.get('programId') || programId,
      categoryId: searchParams.get('categoryId') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      status: searchParams.get('status') as any,
      priority: searchParams.get('priority') as any,
      isPinned: searchParams.get('isPinned') === 'true' ? true : undefined,
      isLocked: searchParams.get('isLocked') === 'true' ? true : undefined,
      isApproved: searchParams.get('isApproved') === 'true' ? true : searchParams.get('isApproved') === 'false' ? false : defaultIsApproved,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: (searchParams.get('sortBy') as any) || 'lastReplyAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };
    
    console.log('Forum topics filters:', { programId, filters, userRole });

    const repository = new SupabaseForumRepository();
    const useCase = new ListTopicsUseCase(repository);
    const result = await useCase.execute(filters);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
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

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, companies!inner(program_id)')
      .eq('id', user.id)
      .single();

    if (!userData || !userData.company_id) {
      return NextResponse.json({ error: 'Firma bilgisi bulunamadı' }, { status: 404 });
    }

    const body = await request.json();
    const dto: CreateTopicDto = {
      programId: userData.companies.program_id,
      categoryId: body.categoryId,
      title: body.title,
      content: body.content,
      priority: body.priority,
    };

    const repository = new SupabaseForumRepository();
    const useCase = new CreateTopicUseCase(repository);
    const result = await useCase.execute(dto, user.id, userData.company_id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('POST /api/forum/topics error:', error);
    return NextResponse.json({ error: 'Konu oluşturulamadı' }, { status: 500 });
  }
}

