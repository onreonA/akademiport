import { NextRequest, NextResponse } from 'next/server';

import { createAuthErrorResponse, requireAuth } from '@/lib/jwt-utils';
import { ROLE_GROUPS } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/consultant/tasks/[id]/approve
 * Danışman görev tamamlamasını onaylama
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // JWT Authentication - Admin and consultant only
    const user = await requireAuth(request);

    // Danışman veya admin kontrolü
    if (!ROLE_GROUPS.ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için danışman yetkisi gerekli' },
        { status: 403 }
      );
    }

    const supabase = createClient();
    const { id: taskId } = await params;

    // Request body'den onay bilgilerini al
    const body = await request.json();
    const { approvalNote, qualityScore } = body;

    // Kullanıcı bilgilerini al (danışman veya admin)
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('email', user.email)
      .single();

    if (userError || !currentUser) {
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
          status: 'approved',
          approved_by: currentUser.id,
          approved_at: new Date().toISOString(),
          approval_note: approvalNote || 'Görev onaylandı',
          quality_score: qualityScore || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', completionRecord.id)
        .select()
        .single();

    if (updateCompletionError) {
      return NextResponse.json(
        { error: 'Görev onayı güncellenirken hata oluştu' },
        { status: 500 }
      );
    }

    // Görev durumunu tamamlandı olarak güncelle
    const { data: updatedTask, error: updateTaskError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateTaskError) {
      // Görev durumu güncellenemedi ama onay kaydedildi
    }

    // Görev geçmişine kayıt ekle
    const { error: historyError } = await supabase.from('task_history').insert({
      task_id: taskId,
      action: 'approved',
      old_value: 'pending_approval',
      new_value: 'approved',
      user_id: currentUser.id,
      notes: approvalNote || 'Görev danışman tarafından onaylandı',
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
          title: 'Görev Onaylandı',
          message: `${(completionRecord.tasks as any).title} görevi onaylandı`,
          type: 'task_approved',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            task_title: (completionRecord.tasks as any).title,
            approved_by: currentUser.full_name,
            approval_note: approvalNote,
            quality_score: qualityScore,
          },
        });

      if (notificationError) {
        // Notification error - non-critical
      }
    }

    // Proje ilerlemesini güncelle
    const { error: projectProgressError } = await supabase.rpc(
      'update_project_progress',
      {
        project_id: (completionRecord.tasks as any).project_id,
      }
    );

    if (projectProgressError) {
      // Project progress update error - non-critical
    }

    const response = {
      success: true,
      message: 'Görev başarıyla onaylandı',
      task: {
        id: updatedTask?.id || taskId,
        title: (completionRecord.tasks as any).title,
        status: 'completed',
        approvedAt: updatedCompletion.approved_at,
        approvedBy: currentUser.full_name,
      },
      completion: {
        id: updatedCompletion.id,
        status: updatedCompletion.status,
        approvalNote: updatedCompletion.approval_note,
        qualityScore: updatedCompletion.quality_score,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required') {
      return createAuthErrorResponse(error.message, 401);
    }

    return NextResponse.json(
      {
        error: 'Sunucu hatası',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
