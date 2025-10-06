import { NextRequest, NextResponse } from 'next/server';

import { emailService } from '@/lib/email-service';
import { createClient } from '@/lib/supabase/server';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createClient();
    // Try to fetch from real database first
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        companies:company_id(name),
        consultants:consultant_id(email, full_name)
      `
      )
      .eq('id', id)
      .single();
    if (!error && appointment) {
      return NextResponse.json({ appointment });
    }
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    // Update data preparation
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    // Status update
    if (body.status) {
      updateData.status = body.status;
    }
    // Consultant assignment
    if (body.consultant_id) {
      updateData.consultant_id = body.consultant_id;
    }
    // Notes update
    if (body.notes !== undefined) {
      updateData.attendance_notes = body.notes;
    }
    // Attendance notes update (admin panel)
    if (body.attendance_notes !== undefined) {
      updateData.attendance_notes = body.attendance_notes;
    }
    // Priority update
    if (body.priority) {
      updateData.priority = body.priority;
    }
    // Meeting link update
    if (body.meeting_link) {
      updateData.meeting_link = body.meeting_link;
    }
    // Meeting location update
    if (body.meeting_location) {
      updateData.meeting_location = body.meeting_location;
    }
    // Update appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // Send email notifications based on update type
    try {
      if (body.status) {
        // Status change notification
        const { data: companyUser } = await supabase
          .from('company_users')
          .select('email')
          .eq('company_id', appointment.company_id)
          .single();
        if (companyUser?.email) {
          if (body.status === 'confirmed') {
            await emailService.sendAppointmentConfirmed(companyUser.email, {
              userName: companyUser.email.split('@')[0],
              subject: appointment.title,
              appointmentDate: appointment.preferred_date,
              appointmentTime: appointment.preferred_time,
              status: appointment.status,
              meetingLink: appointment.meeting_link,
              meetingLocation: appointment.meeting_location,
              notes: appointment.attendance_notes,
            });
          } else if (body.status === 'rejected') {
            await emailService.sendAppointmentRejected(companyUser.email, {
              userName: companyUser.email.split('@')[0],
              subject: appointment.title,
              appointmentDate: appointment.preferred_date,
              status: appointment.status,
              notes: appointment.attendance_notes,
            });
          }
        }
      }
      if (body.consultant_id) {
        // Consultant assignment notification
        const { data: companyUser } = await supabase
          .from('company_users')
          .select('email')
          .eq('company_id', appointment.company_id)
          .single();
        const { data: consultant } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', body.consultant_id)
          .single();
        if (companyUser?.email && consultant?.full_name) {
          await emailService.sendConsultantAssigned(companyUser.email, {
            userName: companyUser.email.split('@')[0],
            consultantName: consultant.full_name,
            subject: appointment.title,
            appointmentDate: appointment.preferred_date,
            appointmentTime: appointment.preferred_time,
          });
        }
      }
    } catch (emailError) {}
    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function DELETE(
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
    const supabase = createClient();
    // Try to delete from real database
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
