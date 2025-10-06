import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET - Randevu notlarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: appointmentId } = await params;
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    const supabase = createClient();
    // Get notes for the appointment
    const { data: notes, error } = await supabase
      .from('appointment_notes')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }
    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST - Yeni not ekle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: appointmentId } = await params;
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { noteType, content } = body;
    if (!noteType || !content) {
      return NextResponse.json(
        { error: 'Note type and content required' },
        { status: 400 }
      );
    }
    if (!['company', 'admin', 'consultant'].includes(noteType)) {
      return NextResponse.json({ error: 'Invalid note type' }, { status: 400 });
    }
    const supabase = createClient();
    // Check if appointment exists
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, company_id')
      .eq('id', appointmentId)
      .single();
    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    // Check permissions based on note type
    if (noteType === 'company') {
      // Check if user belongs to the company
      const { data: companyUser } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('email', userEmail)
        .eq('company_id', appointment.company_id)
        .single();
      if (!companyUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (noteType === 'admin' || noteType === 'consultant') {
      // Check if user is admin
      if (userEmail !== 'admin@ihracatakademi.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    // Create note
    const noteData = {
      appointment_id: appointmentId,
      note_type: noteType,
      content: content,
      created_by: userEmail,
    };
    const { data: note, error: insertError } = await supabase
      .from('appointment_notes')
      .insert(noteData)
      .select()
      .single();
    if (insertError) {
      return NextResponse.json(
        {
          error: 'Failed to create note',
          details: insertError.message,
          code: insertError.code,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      note,
      message: 'Not başarıyla eklendi',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
