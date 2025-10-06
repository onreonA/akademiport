import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { project_id, name, description, status, start_date, end_date } =
      body;

    // Gerekli alanları kontrol et
    if (!project_id || !name || !description) {
      return NextResponse.json(
        { error: 'Project ID, name and description are required' },
        { status: 400 }
      );
    }

    // Alt projeyi oluştur
    const { data: subProject, error } = await supabase
      .from('sub_projects')
      .insert({
        project_id,
        name,
        description,
        status: status || 'Aktif',
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create sub-project', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subProject,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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

    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Alt projeleri getir
    const { data: subProjects, error } = await supabase
      .from('sub_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-projects', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subProjects,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
