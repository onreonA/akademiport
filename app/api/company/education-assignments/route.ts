import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    // Get company ID from email
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (companyError || !company) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }
    let query = supabase
      .from('company_education_assignments')
      .select(
        `
        *,
        education_sets (
          id,
          name,
          description,
          category,
          total_duration,
          video_count,
          document_count
        )
      `
      )
      .eq('company_id', company.id)
      .order('assigned_at', { ascending: false });
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      query = query.range(
        parseInt(offset),
        parseInt(offset) + (parseInt(limit) || 10) - 1
      );
    }
    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { error: 'Eğitim atamaları getirilirken hata oluştu' },
        { status: 500 }
      );
    }
    // Transform data to match frontend expectations with real video counts
    const transformedData = await Promise.all(
      data?.map(async assignment => {
        // Get actual video count
        const { data: videos } = await supabase
          .from('videos')
          .select('id')
          .eq('set_id', assignment.set_id)
          .eq('status', 'Aktif');

        const { data: documents } = await supabase
          .from('documents')
          .select('id')
          .eq('set_id', assignment.set_id)
          .eq('status', 'Aktif');

        const actualVideoCount = videos?.length || 0;

        return {
          id: assignment.id,
          name: assignment.education_sets?.name,
          description: assignment.education_sets?.description,
          category: assignment.education_sets?.category,
          assignedDate: assignment.assigned_at,
          totalVideos: actualVideoCount,
          completedVideos: Math.floor(
            ((assignment.progress_percentage || 0) * actualVideoCount) / 100
          ),
          completionPercentage: assignment.progress_percentage || 0,
          status:
            assignment.status === 'completed'
              ? 'Tamamlandı'
              : assignment.status === 'active'
                ? 'Devam Ediyor'
                : 'Kilitli',
          estimatedDuration: assignment.education_sets?.total_duration || 0,
          lastWatched: assignment.last_accessed_at,
          isLocked: assignment.status === 'inactive',
          set_id: assignment.set_id,
        };
      }) || []
    );
    return NextResponse.json({
      data: transformedData,
      count,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }
    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    if (!['admin', 'master_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    const body = await request.json();
    const { company_id, set_id, notes } = body;
    // Validate required fields
    if (!company_id || !set_id) {
      return NextResponse.json(
        { error: 'Firma ID ve Set ID gerekli' },
        { status: 400 }
      );
    }
    // Check if assignment already exists
    const { data: existingAssignment, error: checkError } = await supabase
      .from('company_education_assignments')
      .select('id')
      .eq('company_id', company_id)
      .eq('set_id', set_id)
      .single();
    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Bu eğitim seti zaten atanmış' },
        { status: 409 }
      );
    }
    // Create assignment
    const { data, error } = await supabase
      .from('company_education_assignments')
      .insert({
        company_id,
        set_id,
        assigned_by: user.id,
        notes: notes || null,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Eğitim ataması oluşturulurken hata oluştu' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      data,
      success: true,
      message: 'Eğitim seti başarıyla atandı',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
