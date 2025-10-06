import { NextRequest, NextResponse } from 'next/server';

import { emailService } from '@/lib/email-service';
import { createClient } from '@/lib/supabase/server';
export async function PATCH(
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
    const { status, reviewNotes } = body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status required (approved/rejected)' },
        { status: 400 }
      );
    }
    const supabase = createClient();
    // Get the revise request details
    const { data: reviseRequest, error: fetchError } = await supabase
      .from('appointment_revise_requests')
      .select(
        `
        *,
        appointments:appointment_id (
          id,
          title,
          description,
          company_id,
          consultant_id,
          preferred_date,
          preferred_time
        ),
        companies:company_id (
          name
        ),
        users:consultant_id (
          full_name,
          email
        )
      `
      )
      .eq('id', id)
      .single();
    if (fetchError || !reviseRequest) {
      return NextResponse.json(
        { error: 'Revise request not found' },
        { status: 404 }
      );
    }
    // Update revise request status
    const updateData = {
      status: status,
      review_notes: reviewNotes || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error: updateError } = await supabase
      .from('appointment_revise_requests')
      .update(updateData)
      .eq('id', id);
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update revise request' },
        { status: 500 }
      );
    }
    // If approved, update the original appointment
    if (status === 'approved') {
      const { error: appointmentUpdateError } = await supabase
        .from('appointments')
        .update({
          preferred_date: reviseRequest.requested_date,
          preferred_time: reviseRequest.requested_time,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviseRequest.appointment_id);
      if (appointmentUpdateError) {
        return NextResponse.json(
          { error: 'Failed to update appointment' },
          { status: 500 }
        );
      }
    }
    // Send email notification to company
    try {
      const { data: companyUser } = await supabase
        .from('company_users')
        .select('email')
        .eq('company_id', reviseRequest.company_id)
        .single();
      if (companyUser?.email) {
        if (status === 'approved') {
          await emailService.sendReviseRequestApproved(companyUser.email, {
            userName: companyUser.email.split('@')[0],
            appointmentTitle: reviseRequest.appointments.title,
            newDate: reviseRequest.requested_date,
            newTime: reviseRequest.requested_time,
            reviewNotes: reviewNotes,
          });
        } else {
          await emailService.sendReviseRequestRejected(companyUser.email, {
            userName: companyUser.email.split('@')[0],
            appointmentTitle: reviseRequest.appointments.title,
            originalDate: reviseRequest.original_date,
            originalTime: reviseRequest.original_time,
            reviewNotes: reviewNotes,
          });
        }
      }
    } catch (emailError) {}
    return NextResponse.json({
      success: true,
      message: `Revize talebi ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
