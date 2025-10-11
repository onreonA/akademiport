import { NextRequest, NextResponse } from 'next/server';

import { createAuthErrorResponse, requireCompany } from '@/lib/jwt-utils';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/projects/[id]
 * Belirli bir projenin detaylarını getirir (firma kullanıcısı için)
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

    // JWT'den company_id'yi al
    const companyId = user.company_id;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Projenin bu firmaya atanıp atanmadığını kontrol et (active veya locked)
    const { data: assignment, error: assignmentError } = await supabase
      .from('project_company_assignments')
      .select('id, status, assigned_at')
      .eq('project_id', id)
      .eq('company_id', companyId)
      .in('status', ['active', 'locked'])
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Bu proje size atanmamış veya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Proje detaylarını getir
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        `
        id,
        name,
        description,
        status,
        start_date,
        end_date,
        progress,
        consultant_id,
        admin_note,
        created_at,
        updated_at
      `
      )
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
    }

    // Firma bazlı tarihleri getir - Use admin client for bypassing RLS
    const adminSupabase = createAdminClient();
    const { data: companyDates, error: datesError } = await adminSupabase
      .from('project_company_dates')
      .select('start_date, end_date')
      .eq('project_id', id)
      .eq('company_id', companyId)
      .single();

    // Eğer firma bazlı tarihler varsa, bunları kullan
    if (companyDates && !datesError) {
      project.start_date = companyDates.start_date;
      project.end_date = companyDates.end_date;
    }

    // Alt projeleri getir - önce tüm alt projeleri al
    const { data: allSubProjects, error: subProjectsError } = await supabase
      .from('sub_projects')
      .select(
        `
        id,
        name,
        description,
        status,
        start_date,
        end_date,
        progress,
        created_at,
        updated_at
      `
      )
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    if (subProjectsError) {
      console.error('Sub projects error:', subProjectsError);
    }

    // Sadece atanmış alt projeleri filtrele ve firma bazlı tarihleri ekle
    const subProjects = [];
    if (allSubProjects && allSubProjects.length > 0) {
      // Her alt proje için atama kontrolü yap
      for (const subProject of allSubProjects) {
        const { data: assignment } = await supabase
          .from('sub_project_company_assignments')
          .select('id, status')
          .eq('sub_project_id', subProject.id)
          .eq('company_id', companyId)
          .eq('status', 'active')
          .single();

        if (assignment) {
          // Firma bazlı alt proje tarihlerini getir
          const { data: subProjectCompanyDates, error: subProjectDatesError } =
            await adminSupabase
              .from('sub_project_company_dates')
              .select('start_date, end_date')
              .eq('sub_project_id', subProject.id)
              .eq('company_id', companyId)
              .single();

          // Eğer firma bazlı tarihler varsa, bunları kullan
          if (subProjectCompanyDates && !subProjectDatesError) {
            subProject.start_date = subProjectCompanyDates.start_date;
            subProject.end_date = subProjectCompanyDates.end_date;
          }
          // Eğer firma bazlı tarihler yoksa, orijinal tarihleri koru
          // (zaten allSubProjects'ten gelen tarihler korunuyor)

          subProjects.push(subProject);
        }
      }
    }

    // Görevleri getir - sadece atanmış alt projelerdeki görevler
    let tasks: any[] = [];
    let tasksError = null;

    if (subProjects && subProjects.length > 0) {
      const subProjectIds = subProjects?.map(sp => sp.id) || [];

      const { data: subProjectTasks, error: subProjectTasksError } =
        await supabase
          .from('tasks')
          .select(
            `
          id,
          title,
          description,
          status,
          priority,
          sub_project_id,
          due_date,
          completed_at,
          completed_by,
          sub_projects(
            id,
            name
          )
        `
          )
          .in('sub_project_id', subProjectIds);

      // Firma bazlı görev durumlarını getir
      if (
        subProjectTasks &&
        !subProjectTasksError &&
        subProjectTasks.length > 0
      ) {
        const taskIds = subProjectTasks.map(task => task.id);

        const { data: companyTaskStatuses, error: statusError } = await supabase
          .from('company_task_statuses')
          .select(
            'task_id, status, completed_at, completion_note, approval_note'
          )
          .in('task_id', taskIds)
          .eq('company_id', companyId);

        if (!statusError && companyTaskStatuses) {
          // Task'ların status'unu firma bazlı olarak güncelle
          subProjectTasks.forEach(task => {
            const companyStatus = companyTaskStatuses.find(
              cts => cts.task_id === task.id
            );
            if (companyStatus) {
              // Company-specific status exists, use it
              task.status = companyStatus.status;
              task.completed_at = companyStatus.completed_at;
              task.completion_note = companyStatus.completion_note;
              task.approval_note = companyStatus.approval_note;
            } else {
              // No company-specific status, reset to original status
              task.status = 'Bekliyor';
              task.completed_at = null;
              task.completion_note = null;
            }
          });
        }
      }

      if (!subProjectTasksError && subProjectTasks) {
        // Her görev için firma bazlı tarihleri getir
        for (const task of subProjectTasks) {
          const { data: taskCompanyDates, error: taskDatesError } =
            await adminSupabase
              .from('task_company_dates')
              .select('start_date, end_date')
              .eq('task_id', task.id)
              .eq('company_id', companyId)
              .single();

          // Eğer firma bazlı tarihler varsa, bunları kullan
          if (taskCompanyDates && !taskDatesError) {
            task.start_date = taskCompanyDates.start_date; // start_date ekle
            task.due_date = taskCompanyDates.end_date; // due_date olarak end_date kullan
          }
        }
        tasks = [...tasks, ...subProjectTasks];
      } else {
        tasksError = subProjectTasksError;
      }
    }

    // Firma bazlı progress hesapla
    let companyProgress = 0;
    if (tasks && tasks.length > 0) {
      const allTaskIds = tasks.map(task => task.id);

      const { data: allCompanyTaskStatuses } = await supabase
        .from('company_task_statuses')
        .select('task_id, status')
        .in('task_id', allTaskIds)
        .eq('company_id', companyId);

      const completedTasks =
        allCompanyTaskStatuses?.filter(cts => cts.status === 'Tamamlandı')
          .length || 0;

      companyProgress =
        allTaskIds.length > 0
          ? Math.round((completedTasks / allTaskIds.length) * 100)
          : 0;
    }

    // Alt proje bazlı progress hesapla
    const subProjectsWithProgress = [];
    for (const subProject of subProjects || []) {
      // Bu alt projeye ait task'ları bul
      const subProjectTasks = tasks.filter(
        task => task.sub_project_id === subProject.id
      );

      let subProjectProgress = 0;
      if (subProjectTasks.length > 0) {
        const subProjectTaskIds = subProjectTasks.map(task => task.id);

        const { data: subProjectCompanyTaskStatuses } = await supabase
          .from('company_task_statuses')
          .select('task_id, status')
          .in('task_id', subProjectTaskIds)
          .eq('company_id', companyId);

        const completedSubProjectTasks =
          subProjectCompanyTaskStatuses?.filter(
            cts => cts.status === 'Tamamlandı'
          ).length || 0;

        subProjectProgress =
          subProjectTaskIds.length > 0
            ? Math.round(
                (completedSubProjectTasks / subProjectTaskIds.length) * 100
              )
            : 0;
      }

      subProjectsWithProgress.push({
        ...subProject,
        progress_percentage: subProjectProgress,
      });
    }

    // Danışman bilgilerini getir (eğer varsa)
    let consultantInfo = null;
    if (project.consultant_id) {
      const { data: consultant, error: consultantError } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('id', project.consultant_id)
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

    // Proje dosyalarını getir (eğer dosya sistemi varsa)
    const { data: projectFiles, error: filesError } = await supabase
      .from('project_files')
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
      .eq('project_id', id)
      .order('uploaded_at', { ascending: false });

    // Proje yorumlarını getir (eğer yorum sistemi varsa)
    const { data: projectComments, error: commentsError } = await supabase
      .from('project_comments')
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
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    // Firma bilgilerini database'den getir
    const { data: companyInfo, error: companyInfoError } = await supabase
      .from('companies')
      .select('id, name, city, industry, email, phone, address')
      .eq('id', companyId)
      .single();

    // Veriyi frontend formatına dönüştür
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      deadline: project.end_date, // Frontend compatibility
      progressPercentage: companyProgress, // Firma bazlı progress
      consultantId: project.consultant_id,
      consultant: consultantInfo,
      adminNote: project.admin_note,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      assignedAt: assignment.assigned_at,
      assignmentStatus: assignment.status,
      companies: companyInfo
        ? {
            id: companyInfo.id,
            name: companyInfo.name,
            city: companyInfo.city || 'Belirtilmemiş',
            industry: companyInfo.industry || 'Diğer',
            email: companyInfo.email,
            phone: companyInfo.phone || '',
            address: companyInfo.address || '',
          }
        : {
            id: companyId,
            name: 'Firma Bilgisi Bulunamadı',
            city: 'Belirtilmemiş',
            industry: 'Diğer',
            email: '',
            phone: '',
            address: '',
          },
      subProjects: (subProjectsWithProgress || []).map(sp => ({
        id: sp.id,
        name: sp.name,
        description: sp.description,
        status: sp.status,
        startDate: sp.start_date,
        endDate: sp.end_date,
        progress: sp.progress_percentage || sp.progress || 0,
        progress_percentage: sp.progress_percentage || 0,
        createdAt: sp.created_at,
        updatedAt: sp.updated_at,
      })),
      tasks: (tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.start_date,
        endDate: task.due_date,
        dueDate: task.due_date,
        start_date: task.start_date, // Frontend compatibility
        due_date: task.due_date, // Frontend compatibility
        assignedTo: task.assigned_to,
        progress: task.progress || 0,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        completed_at: task.completed_at, // Company-specific field
        completion_note: task.completion_note, // Company-specific field
        approval_note: task.approval_note, // Company-specific field
        subProject: task.sub_projects
          ? {
              id: task.sub_projects.id,
              name: task.sub_projects.name,
            }
          : null,
      })),
      project_files: (projectFiles || []).map(file => ({
        id: file.id,
        fileName: file.file_name,
        filePath: file.file_path,
        fileSize: file.file_size,
        uploadedBy: file.uploaded_by,
        uploadedAt: file.uploaded_at,
      })),
      project_comments: (projectComments || []).map(comment => ({
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
      // Frontend compatibility için ek alanlar
      type: 'assigned',
      priority: 'medium',
    };

    const response = {
      success: true,
      project: formattedProject,
      // Frontend için ayrı field'lar
      subProjects: (subProjectsWithProgress || []).map(sp => ({
        id: sp.id,
        name: sp.name,
        description: sp.description,
        status: sp.status,
        startDate: sp.start_date,
        endDate: sp.end_date,
        progress: sp.progress_percentage || sp.progress || 0,
        progress_percentage: sp.progress_percentage || 0,
        createdAt: sp.created_at,
        updatedAt: sp.updated_at,
      })),
      tasks: (tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.start_date,
        endDate: task.due_date,
        dueDate: task.due_date,
        start_date: task.start_date, // Frontend compatibility
        due_date: task.due_date, // Frontend compatibility
        assignedTo: task.assigned_to,
        progress: task.progress || 0,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        completed_at: task.completed_at, // Company-specific field
        completion_note: task.completion_note, // Company-specific field
        approval_note: task.approval_note, // Company-specific field
        subProject: task.sub_projects
          ? {
              id: task.sub_projects.id,
              name: task.sub_projects.name,
            }
          : null,
      })),
      companyId: companyId,
      assignmentStatus: assignment.status,
      isLocked: assignment.status === 'locked',
      debug: {
        tasksFound: tasks.length,
        subProjectsCount: subProjects?.length || 0,
        subProjectIds: subProjects?.map(sp => sp.id) || [],
        manualTasksFound: 0,
        manualTasksData: [],
        apiCalled: true,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    // Handle authentication errors specifically
    if (
      error.message === 'Authentication required' ||
      error.message === 'Company access required'
    ) {
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
