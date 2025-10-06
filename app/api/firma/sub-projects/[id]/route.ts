import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/sub-projects/[id]
 * Belirli bir alt projenin detaylarını getirir (firma kullanıcısı için)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

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

    // Alt projenin bu firmaya atanıp atanmadığını kontrol et
    const { data: assignment, error: assignmentError } = await supabase
      .from('sub_project_company_assignments')
      .select('id, status, assigned_at')
      .eq('sub_project_id', id)
      .eq('company_id', companyUser.company_id)
      .eq('status', 'active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Bu alt proje size atanmamış veya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Alt proje detaylarını getir
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select(
        `
        id,
        project_id,
        name,
        description,
        status,
        start_date,
        end_date,
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
        )
      `
      )
      .eq('id', id)
      .single();

    if (subProjectError || !subProject) {
      return NextResponse.json(
        { error: 'Alt proje bulunamadı' },
        { status: 404 }
      );
    }

    // Bu alt projeye ait görevleri getir
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(
        `
        id,
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
        updated_at
      `
      )
      .eq('sub_project_id', id)
      .order('created_at', { ascending: true });

    // Danışman bilgilerini getir (eğer varsa)
    let consultantInfo = null;
    if (subProject.projects.consultant_id) {
      const { data: consultant, error: consultantError } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('id', subProject.projects.consultant_id)
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

    // Alt proje dosyalarını getir (eğer dosya sistemi varsa)
    const { data: subProjectFiles, error: filesError } = await supabase
      .from('sub_project_files')
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
      .eq('sub_project_id', id)
      .order('uploaded_at', { ascending: false });

    // Alt proje yorumlarını getir (eğer yorum sistemi varsa)
    const { data: subProjectComments, error: commentsError } = await supabase
      .from('sub_project_comments')
      .select(
        `
        id,
        comment,
        user_id,
        created_at,
        users(
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq('sub_project_id', id)
      .order('created_at', { ascending: false });

    // Veriyi frontend formatına dönüştür
    const formattedSubProject = {
      id: subProject.id,
      projectId: subProject.project_id,
      name: subProject.name,
      description: subProject.description,
      status: subProject.status,
      startDate: subProject.start_date,
      endDate: subProject.end_date,
      progress: subProject.progress || 0,
      createdAt: subProject.created_at,
      updatedAt: subProject.updated_at,
      assignedAt: assignment.assigned_at,
      assignmentStatus: assignment.status,
      // Ana proje bilgileri
      project: {
        id: subProject.projects.id,
        name: subProject.projects.name,
        description: subProject.projects.description,
        status: subProject.projects.status,
        startDate: subProject.projects.start_date,
        endDate: subProject.projects.end_date,
        progress: subProject.projects.progress || 0,
        consultantId: subProject.projects.consultant_id,
        consultant: consultantInfo,
        adminNote: subProject.projects.admin_note,
        companies: {
          id: subProject.projects.companies.id,
          name: subProject.projects.companies.name,
          city: subProject.projects.companies.city,
          industry: subProject.projects.companies.industry,
          email: subProject.projects.companies.email,
          phone: subProject.projects.companies.phone,
          address: subProject.projects.companies.address,
        },
      },
      // Alt projeye ait görevler
      tasks: (tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.start_date,
        endDate: task.end_date,
        dueDate: task.due_date,
        assignedTo: task.assigned_to,
        progress: task.progress || 0,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      })),
      // Alt proje dosyaları
      files: (subProjectFiles || []).map(file => ({
        id: file.id,
        fileName: file.file_name,
        filePath: file.file_path,
        fileSize: file.file_size,
        uploadedBy: file.uploaded_by,
        uploadedAt: file.uploaded_at,
      })),
      // Alt proje yorumları
      comments: (subProjectComments || []).map(comment => ({
        id: comment.id,
        comment: comment.comment,
        userId: comment.user_id,
        createdAt: comment.created_at,
        user: comment.users
          ? {
              id: comment.users.id,
              name: comment.users.full_name,
              avatar: comment.users.avatar_url,
            }
          : null,
      })),
      // İstatistikler
      stats: {
        totalTasks: (tasks || []).length,
        completedTasks: (tasks || []).filter(t => t.status === 'completed')
          .length,
        pendingTasks: (tasks || []).filter(t => t.status === 'pending').length,
        inProgressTasks: (tasks || []).filter(t => t.status === 'in_progress')
          .length,
        overdueTasks: (tasks || []).filter(
          t =>
            t.due_date &&
            new Date(t.due_date) < new Date() &&
            t.status !== 'completed'
        ).length,
      },
    };

    const response = {
      success: true,
      subProject: formattedSubProject,
      companyId: companyUser.company_id,
      userEmail: userEmail,
      userRole: userRole,
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
