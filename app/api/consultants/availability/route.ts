import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const consultantId = searchParams.get('consultant_id');
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0=Pazar, 1=Pazartesi, ...
    let query = supabase
      .from('consultant_availability')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);
    if (consultantId) {
      query = query.eq('consultant_id', consultantId);
    }
    const { data: availability, error } = await query;
    if (error) throw error;
    // Özel tarihleri kontrol et (tatil, müsait olmadığı günler)
    let specialDatesQuery = supabase
      .from('consultant_special_dates')
      .select('*')
      .eq('date', date);
    if (consultantId) {
      specialDatesQuery = specialDatesQuery.eq('consultant_id', consultantId);
    }
    const { data: specialDates, error: specialError } = await specialDatesQuery;
    if (specialError) throw specialError;
    // Müsait olmayan danışmanları filtrele
    const unavailableConsultants = specialDates
      .filter(sd => !sd.is_available)
      .map(sd => sd.consultant_id);
    const filteredAvailability = availability.filter(
      av => !unavailableConsultants.includes(av.consultant_id)
    );
    return NextResponse.json({ availability: filteredAvailability });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 401 }
      );
    }
    // Kullanıcıyı bul
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Danışman müsaitlik bilgisini güncelle
    const { data, error } = await supabase
      .from('consultant_availability')
      .upsert({
        consultant_id: user.id,
        day_of_week: body.day_of_week,
        start_time: body.start_time,
        end_time: body.end_time,
        is_available: body.is_available,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ availability: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
