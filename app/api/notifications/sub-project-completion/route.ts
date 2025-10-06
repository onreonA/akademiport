import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Alt proje tamamlama bildirimlerini oluştur
export async function POST(request: NextRequest) {
  try {
    const { subProjectCompletionId } = await request.json();

    if (!subProjectCompletionId) {
      return NextResponse.json(
        { error: 'Sub project completion ID is required' },
        { status: 400 }
      );
    }

    // Alt proje tamamlama bilgilerini getir
    const { data: completion, error: completionError } = await supabase
      .from('sub_project_completions')
      .select(
        `
        *,
        sub_projects (
          id,
          name,
          description,
          project_id,
          projects (
            id,
            name
          )
        ),
        companies (
          id,
          name,
          industry
        ),
        company_users (
          id,
          full_name,
          email
        )
      `
      )
      .eq('id', subProjectCompletionId)
      .single();

    if (completionError || !completion) {
      return NextResponse.json(
        { error: 'Sub project completion not found' },
        { status: 404 }
      );
    }

    // Danışmanları bul (admin, master_admin, consultant rolündeki kullanıcılar)
    const { data: consultants, error: consultantsError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('role', ['admin', 'master_admin', 'consultant']);

    if (consultantsError || !consultants?.length) {
      return NextResponse.json(
        { error: 'No consultants found' },
        { status: 404 }
      );
    }

    // Her danışman için bildirim oluştur
    const notifications = consultants.map(consultant => ({
      user_id: consultant.id,
      title: 'Yeni Alt Proje Tamamlama',
      message: `${completion.companies.name} firması "${completion.sub_projects.name}" alt projesini %${completion.completion_percentage} oranında tamamladı. Değerlendirme raporu yazmak için tıklayın.`,
      type: 'sub_project_completion',
      data: {
        sub_project_completion_id: subProjectCompletionId,
        company_name: completion.companies.name,
        sub_project_name: completion.sub_projects.name,
        main_project_name: completion.sub_projects.projects.name,
        completion_percentage: completion.completion_percentage,
        completed_by: completion.company_users.name,
        completed_at: completion.completed_at,
      },
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    // Bildirimleri veritabanına kaydet
    const { data: savedNotifications, error: saveError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (saveError) {
      console.error('Error saving notifications:', saveError);
      return NextResponse.json(
        { error: 'Failed to save notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: savedNotifications,
      count: savedNotifications?.length || 0,
    });
  } catch (error) {
    console.error('Error in sub-project completion notification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
