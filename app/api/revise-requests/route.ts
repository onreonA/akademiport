import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get all revise requests with company and consultant details
    const { data: reviseRequests, error } = await supabase
      .from('appointment_revise_requests')
      .select(
        `
        *,
        appointments:appointment_id (
          title,
          description,
          meeting_type
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
      .order('requested_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch revise requests' },
        { status: 500 }
      );
    }
    return NextResponse.json({ reviseRequests: reviseRequests || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
