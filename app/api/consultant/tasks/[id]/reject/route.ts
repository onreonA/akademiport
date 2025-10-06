import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/consultant/tasks/[id]/reject
 * Danışman görev tamamlamasını reddetme
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

    // Request body'den red bilgilerini al
    const body = await request.json();
    const { rejectionReason, requiredActions } = body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Red sebebi gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcı bilgilerini al (danışman veya admin)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Görev tamamlama kaydını bul
    const { data: completionRecord, error: completionError } = await supabase
      .from('task_completions')
      .select(
        `
        id,
        task_id,
        completed_by,
        completion_note,
        completion_date,
        actual_hours,
        status,
        tasks(
          id,
          title,
          description,
          status,
          project_id,
          sub_project_id,
          projects(
            id,
            name,
            companies(
              id,
              name
            )
          )
        )
      `
      )
      .eq('task_id', taskId)
      .eq('status', 'pending_approval')
      .single();

    if (completionError || !completionRecord) {
      return NextResponse.json(
        { error: 'Onay bekleyen görev tamamlama kaydı bulunamadı' },
        { status: 404 }
      );
    }

    // Görev tamamlama durumunu güncelle
    const { data: updatedCompletion, error: updateCompletionError } =
      await supabase
        .from('task_completions')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          approval_note: rejectionReason,
          required_actions: requiredActions || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', completionRecord.id)
        .select()
        .single();

    if (updateCompletionError) {
      return NextResponse.json(
        { error: 'Görev reddi güncellenirken hata oluştu' },
        { status: 500 }
      );
    }

    // Görev durumunu "devam ediyor" olarak güncelle (yeniden çalışılabilir)
    const { data: updatedTask, error: updateTaskError } = await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        progress: Math.max((completionRecord.tasks as any).progress || 0, 50), // En az %50'ye geri döndür
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateTaskError) {
      // Görev durumu güncellenemedi ama red kaydedildi
    }

    // Görev geçmişine kayıt ekle
    const { error: historyError } = await supabase.from('task_history').insert({
      task_id: taskId,
      action: 'rejected',
      old_value: 'pending_approval',
      new_value: 'rejected',
      user_id: user.id,
      notes: `Görev reddedildi: ${rejectionReason}`,
    });

    if (historyError) {
      // History record error - non-critical
    }

    // Firma kullanıcısına bildirim gönder
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('id, name, email, company_id')
      .eq('id', completionRecord.completed_by)
      .single();

    if (companyUser && !companyUserError) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: companyUser.id,
          title: 'Görev Reddedildi',
          message: `${(completionRecord.tasks as any).title} görevi reddedildi`,
          type: 'task_rejected',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            task_title: (completionRecord.tasks as any).title,
            rejected_by: user.full_name,
            rejection_reason: rejectionReason,
            required_actions: requiredActions,
          },
        });

      if (notificationError) {
        // Notification error - non-critical
      }
    }

    // Proje sahibi firmaya da bildirim gönder (eğer farklı firmaysa)
    if (
      (completionRecord.tasks as any).projects.companies.id !==
      companyUser?.company_id
    ) {
      const { error: companyNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: (completionRecord.tasks as any).projects.companies.id,
          title: 'Görev Reddedildi',
          message: `${(completionRecord.tasks as any).title} görevi danışman tarafından reddedildi`,
          type: 'task_rejected',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            task_title: (completionRecord.tasks as any).title,
            rejected_by: user.full_name,
            rejection_reason: rejectionReason,
            company_user: companyUser?.name,
          },
        });

      if (companyNotificationError) {
        // Company notification error - non-critical
      }
    }

    const response = {
      success: true,
      message: 'Görev reddedildi ve firma bilgilendirildi',
      task: {
        id: updatedTask?.id || taskId,
        title: (completionRecord.tasks as any).title,
        status: 'in_progress',
        rejectedAt: updatedCompletion.approved_at,
        rejectedBy: user.full_name,
      },
      completion: {
        id: updatedCompletion.id,
        status: updatedCompletion.status,
        rejectionReason: updatedCompletion.approval_note,
        requiredActions: updatedCompletion.required_actions,
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
