import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/projects/[id]/sub-projects - Get project sub-projects
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    // Kullanıcı bilgilerini al (cookie-based)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Admin yetkisi kontrolü
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      // Firma kullanıcıları için proje yetkisi kontrolü
      if (userRole === 'user' && userCompanyId) {
        // Projenin bu firmaya ait olup olmadığını kontrol et
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('company_id')
          .eq('id', id)
          .single();
        if (projectError || !project) {
          return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
          );
        }
        if (project.company_id !== userCompanyId) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    // Alt projeleri al
    const { data: subProjects, error } = await supabase
      .from('sub_projects')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-projects' },
        { status: 500 }
      );
    }
    return NextResponse.json({ subProjects: subProjects || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/projects/[id]/sub-projects - Create new sub-project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      status = 'Planlandı',
      startDate,
      endDate,
    } = body;
    const supabase = createClient();
    // Kullanıcı bilgilerini al (cookie-based)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Admin yetkisi kontrolü
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      // Firma kullanıcıları için proje yetkisi kontrolü
      if (userRole === 'user' && userCompanyId) {
        // Projenin bu firmaya ait olup olmadığını kontrol et
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('company_id')
          .eq('id', id)
          .single();
        if (projectError || !project) {
          return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
          );
        }
        if (project.company_id !== userCompanyId) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    if (!name) {
      return NextResponse.json(
        { error: 'Sub-project name is required' },
        { status: 400 }
      );
    }
    // Alt proje oluştur
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .insert({
        project_id: id,
        name,
        description,
        status,
        start_date: startDate,
        end_date: endDate,
        progress: 0,
      })
      .select()
      .single();

    if (subProjectError) {
      return NextResponse.json(
        { error: 'Failed to create sub-project' },
        { status: 500 }
      );
    }
    return NextResponse.json({ subProject }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
