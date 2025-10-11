import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { requireCompany, createAuthErrorResponse } from '@/lib/jwt-utils';

/**
 * GET /api/firma/tasks/[id]
 * Belirli bir görevin detaylarını getirir (firma kullanıcısı için)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // JWT Authentication - Company users only
    const user = await requireCompany(request);
    
    const supabase = createClient();
    const { id } = await params;

    // Kullanıcının company_id'sini JWT'den al
    const companyId = user.company_id;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Görevin bu firmaya atanıp atanmadığını kontrol et
    const { data: assignment, error: assignmentError } = await supabase
      .from('task_company_assignments')
      .select('id, status, assigned_at')
      .eq('task_id', id)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Bu görev size atanmamış veya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Görev detaylarını getir
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        project_id,
        sub_project_id,
        title,
        description,
        status,
        priority,
        start_date,
        end_date,
        due_date,
        assigned_to,
        progress,
        created_at,
        updated_at,
        projects!inner(
          id,
          name,
          description,
          status,
          start_date,
          end_date,
          progress,
          consultant_id,
          admin_note,
          companies!inner(
            id,
            name,
            city,
            industry,
            email,
            phone,
            address
          )
        ),
        sub_projects(
          id,
          name,
          description,
          status,
          start_date,
          end_date,
          progress
        )
      `
      )
      .eq('id', id)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    // Atanan kullanıcı bilgilerini getir (eğer varsa)
    let assignedUserInfo = null;
    if (task.assigned_to) {
      const { data: assignedUser, error: assignedUserError } = await supabase
        .from('company_users')
        .select('id, name, email, role')
        .eq('id', task.assigned_to)
        .single();

      if (assignedUser && !assignedUserError) {
        assignedUserInfo = {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email,
          role: assignedUser.role,
        };
      }
    }

    // Danışman bilgilerini getir (eğer varsa)
    let consultantInfo = null;
    if (task.projects.consultant_id) {
      const { data: consultant, error: consultantError } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('id', task.projects.consultant_id)
        .single();

      if (consultant && !consultantError) {
        consultantInfo = {
          id: consultant.id,
          name: consultant.full_name,
          email: consultant.email,
          avatar: consultant.avatar_url,
        };
      }
    }

    // Görev yorumlarını getir
    const { data: taskComments, error: commentsError } = await supabase
      .from('task_comments')
      .select(
        `
        id,
        comment,
        user_id,
        created_at,
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
      .eq('task_id', id)
      .order('created_at', { ascending: false });

    // Görev dosyalarını getir
    const { data: taskFiles, error: filesError } = await supabase
      .from('task_files')
      .select(
        `
        id,
        file_name,
        file_path,
        file_size,
        uploaded_by,
        uploaded_at
      `
      )
      .eq('task_id', id)
      .order('uploaded_at', { ascending: false });

    // Görev geçmişini getir (status değişiklikleri)
    const { data: taskHistory, error: historyError } = await supabase
      .from('task_history')
      .select(
        `
        id,
        action,
        old_value,
        new_value,
        user_id,
        created_at,
        users(
          id,
          full_name,
          email
        ),
        company_users(
          id,
          name,
          email
        )
      `
      )
      .eq('task_id', id)
      .order('created_at', { ascending: false });

    // Veriyi frontend formatına dönüştür
    const formattedTask = {
      id: task.id,
      projectId: task.project_id,
      subProjectId: task.sub_project_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: task.start_date,
      endDate: task.end_date,
      dueDate: task.due_date,
      assignedTo: task.assigned_to,
      assignedUser: assignedUserInfo,
      progress: task.progress || 0,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      assignedAt: assignment.assigned_at,
      assignmentStatus: assignment.status,
      // Ana proje bilgileri
      project: {
        id: task.projects.id,
        name: task.projects.name,
        description: task.projects.description,
        status: task.projects.status,
        startDate: task.projects.start_date,
        endDate: task.projects.end_date,
        progress: task.projects.progress || 0,
        consultantId: task.projects.consultant_id,
        consultant: consultantInfo,
        adminNote: task.projects.admin_note,
        companies: {
          id: task.projects.companies.id,
          name: task.projects.companies.name,
          city: task.projects.companies.city,
          industry: task.projects.companies.industry,
          email: task.projects.companies.email,
          phone: task.projects.companies.phone,
          address: task.projects.companies.address,
        },
      },
      // Alt proje bilgileri (eğer varsa)
      subProject: task.sub_projects
        ? {
            id: task.sub_projects.id,
            name: task.sub_projects.name,
            description: task.sub_projects.description,
            status: task.sub_projects.status,
            startDate: task.sub_projects.start_date,
            endDate: task.sub_projects.end_date,
            progress: task.sub_projects.progress || 0,
          }
        : null,
      // Görev yorumları
      comments: (taskComments || []).map(comment => ({
        id: comment.id,
        comment: comment.comment,
        userId: comment.user_id,
        createdAt: comment.created_at,
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
      })),
      // Görev dosyaları
      files: (taskFiles || []).map(file => ({
        id: file.id,
        fileName: file.file_name,
        filePath: file.file_path,
        fileSize: file.file_size,
        uploadedBy: file.uploaded_by,
        uploadedAt: file.uploaded_at,
      })),
      // Görev geçmişi
      history: (taskHistory || []).map(history => ({
        id: history.id,
        action: history.action,
        oldValue: history.old_value,
        newValue: history.new_value,
        userId: history.user_id,
        createdAt: history.created_at,
        user: history.company_users
          ? {
              id: history.company_users.id,
              name: history.company_users.name,
              email: history.company_users.email,
              type: 'company_user',
            }
          : history.users
            ? {
                id: history.users.id,
                name: history.users.full_name,
                email: history.users.email,
                type: 'admin_user',
              }
            : null,
      })),
      // Görev istatistikleri
      stats: {
        totalComments: (taskComments || []).length,
        totalFiles: (taskFiles || []).length,
        totalHistory: (taskHistory || []).length,
        isOverdue: task.due_date
          ? new Date(task.due_date) < new Date() && task.status !== 'completed'
          : false,
        daysUntilDue: task.due_date
          ? Math.ceil(
              (new Date(task.due_date).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      },
    };

    const response = {
      success: true,
      task: formattedTask,
      companyId: companyUser.company_id,
      userEmail: userEmail,
      userRole: userRole,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required' || 
        error.message === 'Company access required') {
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
