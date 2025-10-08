import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    let query = supabase
      .from('education_sets')
      .select('*')
      .order('created_at', { ascending: false });
    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
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
        { error: 'Eğitim setleri getirilirken hata oluştu' },
        { status: 500 }
      );
    }
    // Calculate actual video counts
    const dataWithActualCounts = await Promise.all(
      data?.map(async (set: any) => {
        const { data: videos, error: videoError } = await supabase
          .from('videos')
          .select('id')
          .eq('set_id', set.id)
          .eq('status', 'Aktif');

        const { data: documents, error: docError } = await supabase
          .from('documents')
          .select('id')
          .eq('set_id', set.id)
          .eq('status', 'Aktif');

        return {
          ...set,
          video_count: videos?.length || 0,
          document_count: documents?.length || 0,
        };
      }) || []
    );

    return NextResponse.json({
      data: dataWithActualCounts,
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
    const {
      name,
      description,
      category,
      status,
      total_duration,
      video_count,
      document_count,
    } = body;
    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    // Create education set
    const { data, error } = await supabase
      .from('education_sets')
      .insert({
        name,
        description,
        category,
        status: status || 'Aktif',
        total_duration: total_duration || 0,
        video_count: video_count || 0,
        document_count: document_count || 0,
        created_by: user.id,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Eğitim seti oluşturulurken hata oluştu' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      data,
      success: true,
      message: 'Eğitim seti başarıyla oluşturuldu',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
export async function PATCH(request: NextRequest) {
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
    const {
      id,
      name,
      description,
      category,
      status,
      total_duration,
      video_count,
      document_count,
    } = body;
    // Validate required fields
    if (!id || !name || !description || !category) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    // Check if education set exists
    const { data: existingSet, error: checkError } = await supabase
      .from('education_sets')
      .select('id')
      .eq('id', id)
      .single();
    if (checkError || !existingSet) {
      return NextResponse.json(
        { error: 'Eğitim seti bulunamadı' },
        { status: 404 }
      );
    }
    // Update education set
    const { data, error } = await supabase
      .from('education_sets')
      .update({
        name,
        description,
        category,
        status: status || 'Aktif',
        total_duration: total_duration || 0,
        video_count: video_count || 0,
        document_count: document_count || 0,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Eğitim seti güncellenirken hata oluştu' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      data,
      success: true,
      message: 'Eğitim seti başarıyla güncellendi',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Eğitim seti ID gerekli' },
        { status: 400 }
      );
    }
    // Check if education set exists
    const { data: existingSet, error: checkError } = await supabase
      .from('education_sets')
      .select('id')
      .eq('id', id)
      .single();
    if (checkError || !existingSet) {
      return NextResponse.json(
        { error: 'Eğitim seti bulunamadı' },
        { status: 404 }
      );
    }
    // Delete education set
    const { error } = await supabase
      .from('education_sets')
      .delete()
      .eq('id', id);
    if (error) {
      return NextResponse.json(
        { error: 'Eğitim seti silinirken hata oluştu' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Eğitim seti başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
