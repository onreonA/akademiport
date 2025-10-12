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
    const isOnline = searchParams.get('is_online');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    // Build query - simplified without joins
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (isOnline !== null) {
      query = query.eq('is_online', isOnline === 'true');
    }
    // Add pagination
    query = query.range(offset, offset + limit - 1);
    const { data: events, error: eventsError, count } = await query;
    if (eventsError) {
      return NextResponse.json(
        { success: false, error: 'Etkinlikler getirilemedi' },
        { status: 500 }
      );
    }
    // Process events data - simplified
    const processedEvents =
      events?.map(event => ({
        ...event,
        consultant: null, // Will be added later
        participants_count: 0, // Will be added later
        attending_count: 0, // Will be added later
        attended_count: 0, // Will be added later
      })) || [];
    return NextResponse.json({
      success: true,
      data: {
        events: processedEvents,
        total_count: count || 0,
        pagination: {
          limit,
          offset,
          total: count || 0,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Etkinlikler getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Only admins can create events
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    // Validate required fields
    const {
      title,
      description,
      category,
      start_date,
      end_date,
      time,
      duration,
      location,
      speaker,
      max_participants,
      is_online,
      meeting_platform,
      meeting_link,
      meeting_id,
      meeting_password,
      consultant_id,
      requirements,
      materials,
      attendance_tracking,
      gamification_enabled,
      points_reward,
    } = body;
    if (
      !title ||
      !description ||
      !category ||
      !start_date ||
      !end_date ||
      !time ||
      !duration ||
      !location ||
      !speaker
    ) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        description,
        category,
        start_date,
        end_date,
        time,
        duration,
        location,
        speaker,
        speaker_bio: body.speaker_bio,
        max_participants: max_participants || 50,
        registered_count: 0,
        status: body.status || 'Planlandı',
        is_online: is_online || false,
        is_free: body.is_free !== false, // Default to true
        meeting_platform: meeting_platform || null,
        meeting_link: meeting_link || null,
        meeting_id: meeting_id || null,
        meeting_password: meeting_password || null,
        consultant_id: consultant_id || null,
        requirements: requirements || [],
        materials: materials || [],
        attendance_tracking: attendance_tracking || false,
        gamification_enabled: gamification_enabled !== false,
        points_reward: points_reward || 0,
        tags: body.tags || [],
      })
      .select()
      .single();
    if (eventError) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik oluşturulamadı' },
        { status: 500 }
      );
    }
    // Add consultant if specified
    if (consultant_id) {
      await supabase.from('event_consultants').insert({
        event_id: event.id,
        consultant_id,
        role: 'organizer',
        is_primary: true,
      });
    }
    return NextResponse.json({
      success: true,
      data: {
        message: 'Etkinlik başarıyla oluşturuldu',
        event,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Etkinlik oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik ID gerekli' },
        { status: 400 }
      );
    }
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Only admins can update events
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    // Update event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (eventError) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik güncellenemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        message: 'Etkinlik başarıyla güncellendi',
        event,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Etkinlik güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik ID gerekli' },
        { status: 400 }
      );
    }
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Only admins can delete events
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    // Delete event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        message: 'Etkinlik başarıyla silindi',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Etkinlik silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
