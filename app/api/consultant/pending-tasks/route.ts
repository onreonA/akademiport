import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/consultant/pending-tasks
 * Danışman onay bekleyen görevleri listeleme
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Kullanıcı kimlik doğrulama
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    // Danışman kontrolü
    if (
      userRole !== 'danışman' &&
      userRole !== 'admin' &&
      userRole !== 'master_admin'
    ) {
      return NextResponse.json(
        { error: 'Bu işlem için danışman yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_approval';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const projectId = searchParams.get('projectId') || '';
    const companyId = searchParams.get('companyId') || '';

    // Onay bekleyen görev tamamlamalarını getir
    let query = supabase
      .from('task_completions')
      .select(
        `
        id,
        task_id,
        completion_note,
        completion_date,
        actual_hours,
        status,
        created_at,
          tasks(
            id,
            title,
            description,
            priority,
            due_date,
            progress,
            project_id,
            sub_project_id,
            projects(
              id,
              name,
              companies(
                id,
                name,
                city,
                industry
              )
            ),
            sub_projects(
              id,
              name
            )
          ),
          company_users(
            id,
            name,
            email,
            company_id
          )
      `
      )
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtreleme
    if (search) {
      query = query.or(
        `tasks.title.ilike.%${search}%,tasks.description.ilike.%${search}%,company_users.name.ilike.%${search}%,tasks.projects.name.ilike.%${search}%`
      );
    }

    if (projectId) {
      query = query.eq('tasks.project_id', projectId);
    }

    if (companyId) {
      query = query.eq('tasks.projects.companies.id', companyId);
    }

    const { data: completions, error: completionsError, count } = await query;

    if (completionsError) {
      return NextResponse.json(
        { error: 'Onay bekleyen görevler yüklenirken hata oluştu' },
        { status: 500 }
      );
    }

    // Verileri formatla
    const formattedCompletions =
      completions?.map(completion => ({
        id: completion.id,
        taskId: completion.task_id,
        task: {
          id: (completion.tasks as any).id,
          title: (completion.tasks as any).title,
          description: (completion.tasks as any).description,
          priority: (completion.tasks as any).priority,
          dueDate: (completion.tasks as any).due_date,
          progress: (completion.tasks as any).progress,
          project: {
            id: (completion.tasks as any).projects.id,
            name: (completion.tasks as any).projects.name,
            company: {
              id: (completion.tasks as any).projects.companies.id,
              name: (completion.tasks as any).projects.companies.name,
              city: (completion.tasks as any).projects.companies.city,
              industry: (completion.tasks as any).projects.companies.industry,
            },
          },
          subProject: (completion.tasks as any).sub_projects
            ? {
                id: (completion.tasks as any).sub_projects.id,
                name: (completion.tasks as any).sub_projects.name,
              }
            : null,
        },
        completion: {
          id: completion.id,
          note: completion.completion_note,
          date: completion.completion_date,
          actualHours: completion.actual_hours,
          status: completion.status,
          createdAt: completion.created_at,
        },
        completedBy: {
          id: (completion.company_users as any).id,
          name: (completion.company_users as any).name,
          email: (completion.company_users as any).email,
          companyId: (completion.company_users as any).company_id,
        },
      })) || [];

    // İstatistikler için ek sorgular
    const statsPromises = [
      // Toplam onay bekleyen
      supabase
        .from('task_completions')
        .select('id', { count: 'exact' })
        .eq('status', 'pending_approval'),

      // Bu ay onaylanan
      supabase
        .from('task_completions')
        .select('id', { count: 'exact' })
        .eq('status', 'approved')
        .gte(
          'approved_at',
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString()
        ),

      // Bu ay reddedilen
      supabase
        .from('task_completions')
        .select('id', { count: 'exact' })
        .eq('status', 'rejected')
        .gte(
          'approved_at',
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString()
        ),
    ];

    const statsResults = await Promise.all(statsPromises);
    const stats = {
      pendingApproval: statsResults[0]?.count || 0,
      approvedThisMonth: statsResults[1]?.count || 0,
      rejectedThisMonth: statsResults[2]?.count || 0,
    };

    const response = {
      success: true,
      completions: formattedCompletions,
      stats,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Sunucu hatası',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
