import { NextRequest, NextResponse } from 'next/server';

import { emailService } from '@/lib/email-service';
import { createClient } from '@/lib/supabase/server';
// Shared mock data store
const mockAppointments: any[] = [];
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const supabase = createClient();
    // Önce kullanıcının şirketini bulalım
    let companyId = null;
    if (userEmail) {
      const { data: companyUser } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('email', userEmail)
        .single();
      companyId = companyUser?.company_id;
    }
    // Önce gerçek veritabanını deneyelim - firma filtresi ile
    let query = supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });
    // Eğer firma kullanıcısı ise sadece kendi firmasının randevularını getir
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    const { data: appointments, error } = await query;
    if (!error && appointments) {
      // Add consultant names and revise history
      const appointmentsWithDetails = await Promise.all(
        appointments.map(async appointment => {
          // Get consultant details
          const { data: consultant } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', appointment.consultant_id)
            .single();
          // Get company details
          const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', appointment.company_id)
            .single();
          // Check if appointment has revise history
          const { data: reviseHistory } = await supabase
            .from('appointment_revise_requests')
            .select('id')
            .eq('appointment_id', appointment.id)
            .limit(1);
          return {
            ...appointment,
            has_revise_history: reviseHistory && reviseHistory.length > 0,
            consultantName: consultant?.full_name || 'Danışman',
            companyName: company?.name || 'Bilinmeyen Firma',
          };
        })
      );
      return NextResponse.json({ appointments: appointmentsWithDetails });
    }
    // Veritabanı hatası varsa mock data kullan
    return NextResponse.json({ appointments: mockAppointments });
  } catch (error) {
    return NextResponse.json({ appointments: mockAppointments });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    const supabase = createClient();
    // Önce kullanıcının şirketini bulalım - company_users tablosundan
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('email', userEmail)
      .single();
    // Eğer company_users tablosunda yoksa, companies tablosundan email ile bul
    if (companyUserError || !companyUser) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (company && !companyError) {
        companyUser = { company_id: company.id };
        // company_users tablosuna da ekle
        await supabase.from('company_users').insert({
          email: userEmail,
          company_id: company.id,
          role: 'user',
        });
      } else {
      }
    }
    // Mock appointment oluştur
    const mockAppointment = {
      id: `appointment_${Date.now()}`,
      consultant_id: body.consultant_id,
      title: body.subject || body.title || 'Randevu Talebi',
      description: body.description,
      meeting_type: body.meeting_type,
      preferred_date: body.preferred_date,
      preferred_time: body.preferred_time,
      status: 'pending',
      priority: body.priority || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company_id: companyUser?.company_id || null,
      consultant_name: 'Demo Danışman',
      company_name: 'Demo Şirket',
      user_email: userEmail,
      attended: false,
      attendance_notes: null,
      meeting_link: null,
      meeting_location: null,
    };
    // Önce gerçek veritabanına kaydetmeyi deneyelim
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          company_id: companyUser?.company_id || null,
          consultant_id: body.consultant_id,
          title: body.subject || body.title || 'Randevu Talebi',
          description: body.description,
          meeting_type: body.meeting_type,
          preferred_date: body.preferred_date,
          preferred_time: body.preferred_time,
          status: 'pending',
          priority: body.priority || 'medium',
        })
        .select('*')
        .single();
      if (!error && appointment) {
        // Send email notification for new appointment
        try {
          await emailService.sendAppointmentCreated(userEmail, {
            userName: userEmail.split('@')[0],
            subject: appointment.title,
            appointmentDate: appointment.preferred_date,
            appointmentTime: appointment.preferred_time,
            status: appointment.status,
          });
        } catch (emailError) {}
        // Emit WebSocket event for new appointment
        try {
          // Get company name for notification
          const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', appointment.company_id)
            .single();
          // Emit to admin room (if WebSocket is available)
          // Note: WebSocket integration will be added in the next step
        } catch (socketError) {}
        return NextResponse.json({ appointment }, { status: 201 });
      }
    } catch (dbError) {}
    // Veritabanı başarısız olursa mock data'ya ekle
    mockAppointments.push(mockAppointment);
    return NextResponse.json({ appointment: mockAppointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
