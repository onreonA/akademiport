import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/projects - Get projects with optional company filter
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    // Check if user is a company user
    const isCompanyUser = [
      'user',
      'operator',
      'manager',
      'firma_admin',
      'firma_kullanıcı',
    ].includes(userRole || '');

    let projects, error;

    if (isCompanyUser && userCompanyId) {
      // Firma kullanıcısı için: Sadece project_company_assignments'ta aktif olan projeler
      console.log('🔍 API - Company user detected:', {
        userCompanyId,
        userRole,
      });

      const { data: assignedProjects, error: assignedError } = await supabase
        .from('project_company_assignments')
        .select(
          `
          project_id,
          projects!inner(
            id,
            name,
            description,
            status,
            start_date,
            end_date,
            progress,
            admin_note,
            created_at,
            updated_at,
            company_id
          )
        `
        )
        .eq('company_id', userCompanyId)
        .eq('status', 'active');

      if (assignedError) {
        projects = [];
        error = assignedError;
      } else {
        projects = assignedProjects?.map(item => item.projects) || [];
        error = null;
      }

      console.log('🔍 API - Company user assigned projects:', {
        projects: projects?.length,
        error,
      });

      // Debug: Her projenin raw verilerini kontrol et
      projects?.forEach((project: any, index: number) => {
        console.log(`🔍 API - Project ${index + 1} Raw Data:`, {
          id: project.id,
          name: project.name,
          end_date: project.end_date,
          start_date: project.start_date,
          status: project.status,
          progress: project.progress,
        });
      });
    } else {
      // Admin/consultant için normal query
      console.log('🔍 API - Admin user detected:', { userRole });

      let query = supabase.from('projects').select(
        `
          id,
          name,
          description,
          status,
          start_date,
          end_date,
          progress,
          admin_note,
          created_at,
          updated_at,
          company_id
        `
      );

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });
      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const result = await query;
      projects = result.data;
      error = result.error;
    }
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      projects: projects || [],
      message: 'Projeler başarıyla getirildi',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Only admin and consultant can create projects
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const body = await request.json();
    const {
      name,
      description,
      status = 'Planlandı',
      startDate,
      endDate,
      adminNote,
      company_id = null,
    } = body;
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }
    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        status,
        start_date: startDate,
        end_date: endDate,
        admin_note: adminNote,
        company_id,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }
    // Format the project for frontend
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status,
      progress: project.progress || 0,
      company_id: project.company_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };
    return NextResponse.json({ project: formattedProject });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// DELETE /api/projects - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Only admin and consultant can delete projects
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    // Delete project
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// PATCH /api/projects - Update project
export async function PATCH(request: NextRequest) {
  try {
    // Debug
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value; // Debug
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Only admin and consultant can update projects
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const body = await request.json();
    const { id, ...updateData } = body; // Debug
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
