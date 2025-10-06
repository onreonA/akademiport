import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/tasks/[id]/company-progress
 * Görev için firma-spesifik ilerlemeleri getirir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const supabase = createClient();

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Sadece admin ve danışman erişebilir
    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Görev bilgilerini al
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        due_date,
        sub_project_id,
        sub_projects (
          id,
          name,
          project_id,
          projects (
            id,
            name
          )
        )
      `
      )
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Firma-spesifik ilerlemeleri al
    const { data: progress, error: progressError } = await supabase
      .from('task_company_progress')
      .select(
        `
        id,
        company_id,
        status,
        progress_percentage,
        started_at,
        completed_at,
        progress_notes,
        completion_notes,
        assigned_at,
        updated_at,
        companies (
          id,
          name,
          email
        )
      `
      )
      .eq('task_id', taskId)
      .order('updated_at', { ascending: false });

    if (progressError) {
      // Eğer veri yoksa boş array döndür, hata verme
      return NextResponse.json({
        task,
        companyProgress: [],
        statistics: {
          totalCompanies: 0,
          completedCompanies: 0,
          inProgressCompanies: 0,
          pendingCompanies: 0,
        },
      });
    }

    // Alt projeye atanmış tüm firmaları al
    const { data: assignedCompanies, error: assignedError } = await supabase
      .from('sub_project_company_assignments')
      .select(
        `
        company_id,
        companies (
          id,
          name,
          email
        )
      `
      )
      .eq('sub_project_id', task.sub_project_id)
      .eq('status', 'active');

    if (assignedError) {
    }

    // Atanmış ama ilerlemesi olmayan firmaları bul
    const assignedCompanyIds =
      assignedCompanies?.map(ac => ac.company_id) || [];
    const progressCompanyIds = progress?.map(p => p.company_id) || [];
    const missingCompanies = assignedCompanyIds.filter(
      id => !progressCompanyIds.includes(id)
    );

    // Eksik firmalar için varsayılan ilerleme oluştur
    const defaultProgress = missingCompanies.map(companyId => {
      const company = assignedCompanies?.find(
        ac => ac.company_id === companyId
      );
      return {
        id: null,
        company_id: companyId,
        status: 'pending',
        progress_percentage: 0,
        started_at: null,
        completed_at: null,
        progress_notes: null,
        completion_notes: null,
        assigned_at: null,
        updated_at: null,
        companies: company?.companies || null,
      };
    });

    // Tüm ilerlemeleri birleştir
    const allProgress = [...(progress || []), ...defaultProgress];

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        subProject: {
          id: task.sub_projects?.id,
          name: task.sub_projects?.name,
          projectName: task.sub_projects?.projects?.name,
        },
      },
      companyProgress: allProgress,
      statistics: {
        totalCompanies: assignedCompanyIds.length,
        completedCompanies:
          progress?.filter(p => p.status === 'completed').length || 0,
        inProgressCompanies:
          progress?.filter(p => p.status === 'in_progress').length || 0,
        pendingCompanies:
          progress?.filter(p => p.status === 'pending').length || 0,
        averageProgress:
          progress?.length > 0
            ? Math.round(
                progress.reduce((sum, p) => sum + p.progress_percentage, 0) /
                  progress.length
              )
            : 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tasks/[id]/company-progress
 * Firma-spesifik görev ilerlemesi oluşturur veya günceller
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const supabase = createClient();
    const body = await request.json();

    const {
      companyId,
      status,
      progressPercentage,
      progressNotes,
      completionNotes,
    } = body;

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Sadece admin ve danışman erişebilir
    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Kullanıcı bilgisini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mevcut ilerlemeyi kontrol et
    const { data: existingProgress, error: existingError } = await supabase
      .from('task_company_progress')
      .select('id')
      .eq('task_id', taskId)
      .eq('company_id', companyId)
      .single();

    if (existingProgress) {
      // Güncelle
      const { data: updatedProgress, error: updateError } = await supabase
        .from('task_company_progress')
        .update({
          status,
          progress_percentage: progressPercentage,
          progress_notes: progressNotes,
          completion_notes: completionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        progress: updatedProgress,
        message: 'Progress updated successfully',
      });
    } else {
      // Yeni oluştur
      const { data: newProgress, error: createError } = await supabase
        .from('task_company_progress')
        .insert({
          task_id: taskId,
          company_id: companyId,
          status,
          progress_percentage: progressPercentage,
          progress_notes: progressNotes,
          completion_notes: completionNotes,
          assigned_by: user.id,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        progress: newProgress,
        message: 'Progress created successfully',
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
