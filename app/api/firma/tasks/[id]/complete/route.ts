import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/firma/tasks/[id]/complete
 * Firma kullanıcısı görev tamamlama
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

    // Request body'den tamamlama bilgilerini al
    const body = await request.json();
    const { completionNote, completionFiles, completionDate, actualHours } =
      body;

    // Kullanıcının company_id'sini al - önce company_users, sonra users tablosundan
    let companyUser = null;
    const companyUserError = null;

    // Önce company_users tablosundan ara
    const { data: companyUserData, error: companyUserDataError } =
      await supabase
        .from('company_users')
        .select('id, company_id, name')
        .eq('email', userEmail)
        .single();

    if (!companyUserDataError && companyUserData) {
      companyUser = companyUserData;
    } else {
      // company_users'da bulunamazsa users tablosundan ara
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('id, company_id, full_name as name')
        .eq('email', userEmail)
        .single();

      if (userDataError || !userData || !userData.company_id) {
        return NextResponse.json(
          { error: 'Firma bilgisi bulunamadı' },
          { status: 404 }
        );
      }
      companyUser = userData;
    }

    // Görevin bu firmaya atanıp atanmadığını kontrol et (alt proje üzerinden)
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        description,
        status,
        project_id,
        sub_project_id,
        projects(
          id,
          name
        )
      `
      )
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    // Alt proje üzerinden firma atamasını kontrol et
    let hasAccess = false;

    if (task.sub_project_id) {
      const { data: subProjectAssignment, error: subProjectAssignmentError } =
        await supabase
          .from('sub_project_company_assignments')
          .select('id, status')
          .eq('sub_project_id', task.sub_project_id)
          .eq('company_id', companyUser.company_id)
          .eq('status', 'active')
          .single();

      hasAccess = !subProjectAssignmentError && subProjectAssignment;
    } else if (task.project_id) {
      // Ana proje üzerinden atama kontrolü
      const { data: projectAssignment, error: projectAssignmentError } =
        await supabase
          .from('project_company_assignments')
          .select('id, status')
          .eq('project_id', task.project_id)
          .eq('company_id', companyUser.company_id)
          .eq('status', 'active')
          .single();

      hasAccess = !projectAssignmentError && projectAssignment;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Bu görev size atanmamış veya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Firma bazlı görev durumunu güncelle
    console.log('🔍 Task completion debug:', {
      taskId,
      companyUser,
      completionNote,
    });

    // Re-enable company_task_statuses with detailed error logging
    console.log('🔍 Attempting to update company_task_statuses...');
    console.log('🔍 Company user details:', {
      id: companyUser.id,
      company_id: companyUser.company_id,
      name: companyUser.name,
    });

    const upsertData = {
      task_id: taskId,
      company_id: companyUser.company_id,
      status: 'Onaya Gönderildi',
      completion_note: completionNote,
      completed_by: companyUser.id, // Now references company_users table
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Use upsert to handle existing records
    const { data: companyTaskStatus, error: statusError } = await supabase
      .from('company_task_statuses')
      .upsert(upsertData, {
        onConflict: 'task_id,company_id',
      })
      .select();

    console.log('🔍 Company task status result:', {
      companyTaskStatus,
      statusError,
    });

    if (statusError) {
      console.error('❌ Company task status error details:', {
        error: statusError,
        message: statusError.message,
        details: statusError.details,
        hint: statusError.hint,
        code: statusError.code,
        upsertData: {
          task_id: taskId,
          company_id: companyUser.company_id,
          status: 'Onaya Gönderildi',
          completion_note: completionNote,
          completed_by: companyUser.id,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      // Return detailed error to frontend
      return NextResponse.json(
        {
          error: 'Firma görev durumu güncellenirken hata oluştu',
          details: statusError.message,
          hint: statusError.hint,
          code: statusError.code,
          debug: {
            task_id: taskId,
            company_id: companyUser.company_id,
            completed_by: companyUser.id,
          },
        },
        { status: 500 }
      );
    }

    // Görev tamamlama kaydı oluştur (mevcut sistem için)
    const { data: completionRecord, error: completionError } = await supabase
      .from('task_completions')
      .insert({
        task_id: taskId,
        completed_by: companyUser.id,
        completion_note: completionNote,
        completion_date: completionDate || new Date().toISOString(),
        actual_hours: actualHours,
        status: 'Tamamlandı', // Danışman onayı bekliyor
      })
      .select()
      .single();

    if (completionError) {
      // Tamamlama kaydı oluşturulamadı ama firma durumu güncellendi
    }

    // Görev geçmişine kayıt ekle
    const { error: historyError } = await supabase.from('task_history').insert({
      task_id: taskId,
      action: 'completed',
      old_value: task.status,
      new_value: 'Onaya Gönderildi',
      user_id: companyUser.id,
      notes: completionNote || 'Görev tamamlandı ve onaya gönderildi',
    });

    if (historyError) {
      // History kaydı oluşturulamadı
    }

    // Danışmana bildirim gönder (eğer varsa)
    // Not: Bildirim sistemi şu anda çalışmıyor, ileride implement edilecek

    const response = {
      success: true,
      message: 'Görev başarıyla tamamlandı ve onay için gönderildi',
      task: {
        id: task.id,
        title: task.title,
        status: 'Onaya Gönderildi',
        completedAt: completionDate || new Date().toISOString(),
        completedBy: companyUser.name,
      },
      companyTaskStatus: companyTaskStatus,
      completionRecord: completionRecord,
      requiresApproval: true,
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
