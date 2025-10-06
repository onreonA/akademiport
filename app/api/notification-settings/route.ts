import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/notification-settings - Get notification settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    // Find user's company if not provided
    let finalCompanyId = companyId;
    if (!finalCompanyId) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (companyError && companyError.code === 'PGRST116') {
        const { data: userCompanyData, error: userCompanyError } =
          await supabase
            .from('company_users')
            .select('company_id')
            .eq('email', userEmail)
            .single();
        if (userCompanyData) {
          company = { id: userCompanyData.company_id };
        }
      }
      if (company) {
        finalCompanyId = company.id;
      }
    }
    if (!finalCompanyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // Get notification settings
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userEmail)
      .eq('company_id', finalCompanyId)
      .single();
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch notification settings' },
        { status: 500 }
      );
    }
    // If no settings found, create default settings
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('notification_settings')
        .insert({
          user_id: userEmail,
          company_id: finalCompanyId,
          email_notifications: true,
          push_notifications: true,
          in_app_notifications: true,
          notification_types: {
            general: true,
            education: true,
            gamification: true,
            system: true,
            assignment: true,
            project: true,
            appointment: true,
            document: true,
          },
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00',
        })
        .select()
        .single();
      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create notification settings' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        data: newSettings,
      });
    }
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// PUT /api/notification-settings - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const {
      company_id,
      email_notifications,
      push_notifications,
      in_app_notifications,
      notification_types,
      quiet_hours_start,
      quiet_hours_end,
    } = body;
    // Find user's company if not provided
    let finalCompanyId = company_id;
    if (!finalCompanyId) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (companyError && companyError.code === 'PGRST116') {
        const { data: userCompanyData, error: userCompanyError } =
          await supabase
            .from('company_users')
            .select('company_id')
            .eq('email', userEmail)
            .single();
        if (userCompanyData) {
          company = { id: userCompanyData.company_id };
        }
      }
      if (company) {
        finalCompanyId = company.id;
      }
    }
    if (!finalCompanyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // Update notification settings
    const { data: updatedSettings, error } = await supabase
      .from('notification_settings')
      .update({
        email_notifications,
        push_notifications,
        in_app_notifications,
        notification_types,
        quiet_hours_start,
        quiet_hours_end,
      })
      .eq('user_id', userEmail)
      .eq('company_id', finalCompanyId)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update notification settings' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
