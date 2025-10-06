import { NextRequest, NextResponse } from 'next/server';

import { emailService } from '@/lib/email-service';
import { createClient } from '@/lib/supabase/server';
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { newDate, newTime, reason, additionalNotes } = body;
    if (!newDate || !newTime || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const supabase = createClient();
    // Get the original appointment
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    // Check if user has permission to revise this appointment
    const { data: companyUser } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('email', userEmail)
      .single();
    if (!companyUser || companyUser.company_id !== appointment.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    // Check if appointment has already been revised
    const { data: existingReviseRequests, error: reviseCheckError } =
      await supabase
        .from('appointment_revise_requests')
        .select('id')
        .eq('appointment_id', id)
        .limit(1);
    if (reviseCheckError) {
      return NextResponse.json(
        { error: 'Revize geçmişi kontrol edilirken hata oluştu' },
        { status: 500 }
      );
    }
    if (existingReviseRequests && existingReviseRequests.length > 0) {
      return NextResponse.json(
        {
          error:
            'Bu randevu zaten revize edilmiş. Tekrar revize talebi gönderilemez.',
        },
        { status: 400 }
      );
    }
    // Create revise request record
    const reviseRequestData = {
      appointment_id: id,
      company_id: appointment.company_id,
      consultant_id: appointment.consultant_id,
      original_date: appointment.preferred_date,
      original_time: appointment.preferred_time,
      requested_date: newDate,
      requested_time: newTime,
      reason: reason,
      additional_notes: additionalNotes || null,
      status: 'pending', // pending, approved, rejected
      requested_by: userEmail,
      requested_at: new Date().toISOString(),
    };
    const { data: reviseRequest, error: insertError } = await supabase
      .from('appointment_revise_requests')
      .insert(reviseRequestData)
      .select()
      .single();
    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create revise request' },
        { status: 500 }
      );
    }
    // Send email notification to consultant
    try {
      const { data: consultant } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', appointment.consultant_id)
        .single();
      if (consultant?.email) {
        await emailService.sendReviseRequest(consultant.email, {
          consultantName: consultant.full_name,
          companyName: appointment.company_id, // You might want to get actual company name
          appointmentTitle: appointment.title,
          originalDate: appointment.preferred_date,
          originalTime: appointment.preferred_time,
          requestedDate: newDate,
          requestedTime: newTime,
          reason: reason,
          additionalNotes: additionalNotes,
        });
      }
    } catch (emailError) {}
    return NextResponse.json({
      success: true,
      reviseRequest,
      message: 'Revize talebi başarıyla gönderildi',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createClient();
    const { data: reviseRequests, error } = await supabase
      .from('appointment_revise_requests')
      .select('*')
      .eq('appointment_id', id)
      .order('requested_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch revise requests' },
        { status: 500 }
      );
    }
    return NextResponse.json({ reviseRequests });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
