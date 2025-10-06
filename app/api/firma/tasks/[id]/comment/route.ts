import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/firma/tasks/[id]/comment
 * Firma kullanıcısı görev yorumu ekleme
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: taskId } = await params;

    // Kullanıcı kimlik doğrulama
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    // Firma kullanıcısı kontrolü
    const COMPANY_ROLES = [
      'user',
      'operator',
      'manager',
      'firma_admin',
      'firma_kullanıcı',
    ];
    if (!COMPANY_ROLES.includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Bu işlem için firma kullanıcısı yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Request body'den yorum bilgilerini al
    const body = await request.json();
    const { comment, commentType = 'general' } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Yorum metni gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcının company_id'sini al
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('id, company_id, name, email')
      .eq('email', userEmail)
      .single();

    if (companyUserError || !companyUser) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Görevin bu firmaya atanıp atanmadığını kontrol et
    const { data: assignment, error: assignmentError } = await supabase
      .from('task_company_assignments')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('company_id', companyUser.company_id)
      .eq('status', 'active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Bu görev size atanmamış veya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Görev detaylarını al
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        status,
        project_id,
        sub_project_id,
        projects!inner(
          id,
          name,
          companies!inner(
            id,
            name
          )
        )
      `
      )
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    // Yorumu kaydet
    const { data: newComment, error: commentError } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: companyUser.id,
        comment: comment.trim(),
        comment_type: commentType,
        user_type: 'company_user',
        created_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        comment,
        comment_type,
        user_type,
        created_at,
        company_users!inner(
          id,
          name,
          email
        )
      `
      )
      .single();

    if (commentError) {
      return NextResponse.json(
        { error: 'Yorum kaydedilirken hata oluştu' },
        { status: 500 }
      );
    }

    // Görev geçmişine kayıt ekle
    const { error: historyError } = await supabase.from('task_history').insert({
      task_id: taskId,
      action: 'comment_added',
      old_value: null,
      new_value: `Yorum eklendi: ${comment.substring(0, 50)}...`,
      user_id: companyUser.id,
      notes: `Yorum türü: ${commentType}`,
    });

    if (historyError) {
    }

    // İlgili kullanıcılara bildirim gönder
    const notificationPromises = [];

    // Proje sahibi firmaya bildirim (eğer farklı firmaysa)
    if (task.projects.companies.id !== companyUser.company_id) {
      notificationPromises.push(
        supabase.from('notifications').insert({
          user_id: task.projects.companies.id,
          title: 'Görev Yorumu',
          message: `${task.title} görevine yeni yorum eklendi`,
          type: 'task_comment',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            task_title: task.title,
            commenter: companyUser.name,
            comment_preview: comment.substring(0, 100),
          },
        })
      );
    }

    // Danışmana bildirim (eğer varsa)
    if (task.consultant_id) {
      notificationPromises.push(
        supabase.from('notifications').insert({
          user_id: task.consultant_id,
          title: 'Görev Yorumu',
          message: `${task.title} görevine firma tarafından yorum eklendi`,
          type: 'task_comment',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            task_title: task.title,
            commenter: companyUser.name,
            comment_preview: comment.substring(0, 100),
          },
        })
      );
    }

    // Tüm bildirimleri gönder
    await Promise.all(notificationPromises);

    const response = {
      success: true,
      message: 'Yorum başarıyla eklendi',
      comment: {
        id: newComment.id,
        comment: newComment.comment,
        commentType: newComment.comment_type,
        userType: newComment.user_type,
        createdAt: newComment.created_at,
        user: {
          id: newComment.company_users.id,
          name: newComment.company_users.name,
          email: newComment.company_users.email,
        },
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

/**
 * GET /api/firma/tasks/[id]/comment
 * Görev yorumlarını listele
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: taskId } = await params;

    // Kullanıcı kimlik doğrulama
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    // Firma kullanıcısı kontrolü
    const COMPANY_ROLES = [
      'user',
      'operator',
      'manager',
      'firma_admin',
      'firma_kullanıcı',
    ];
    if (!COMPANY_ROLES.includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Bu işlem için firma kullanıcısı yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Kullanıcının company_id'sini al
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('email', userEmail)
      .single();

    if (companyUserError || !companyUser) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Görevin bu firmaya atanıp atanmadığını kontrol et
    const { data: assignment, error: assignmentError } = await supabase
      .from('task_company_assignments')
      .select('id')
      .eq('task_id', taskId)
      .eq('company_id', companyUser.company_id)
      .eq('status', 'active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Bu görev size atanmamış veya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Yorumları getir
    const { data: comments, error: commentsError } = await supabase
      .from('task_comments')
      .select(
        `
        id,
        comment,
        comment_type,
        user_type,
        created_at,
        updated_at,
        company_users(
          id,
          name,
          email
        ),
        users(
          id,
          full_name,
          email,
          avatar_url
        )
      `
      )
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (commentsError) {
      return NextResponse.json(
        { error: 'Yorumlar yüklenirken hata oluştu' },
        { status: 500 }
      );
    }

    // Yorumları formatla
    const formattedComments =
      comments?.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        commentType: comment.comment_type,
        userType: comment.user_type,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        user: comment.company_users
          ? {
              id: comment.company_users.id,
              name: comment.company_users.name,
              email: comment.company_users.email,
              type: 'company_user',
            }
          : comment.users
            ? {
                id: comment.users.id,
                name: comment.users.full_name,
                email: comment.users.email,
                avatar: comment.users.avatar_url,
                type: 'admin_user',
              }
            : null,
      })) || [];

    return NextResponse.json({
      success: true,
      comments: formattedComments,
      total: formattedComments.length,
    });
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
