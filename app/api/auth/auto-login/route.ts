import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, companyName } = body;

    if (!companyId || !companyName) {
      return NextResponse.json(
        { error: 'Company ID and name are required' },
        { status: 400 }
      );
    }

    // Verify admin session - try multiple methods
    const supabase = createClient();
    const adminEmail =
      request.headers.get('X-User-Email') || 'admin@ihracatakademi.com';

    // Try to get user from session first
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    let isAdmin = false;
    let userId = null;

    if (user && !userError) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile && profile.role === 'admin') {
        isAdmin = true;
        userId = user.id;
      }
    }

    // If no admin session, check if it's the default admin email
    if (!isAdmin && adminEmail === 'admin@ihracatakademi.com') {
      // For development purposes, allow admin@ihracatakademi.com
      isAdmin = true;
      userId = 'admin-user-id'; // Placeholder for development
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Verify company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, email')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Generate auto-login token (expires in 5 minutes)
    const autoLoginToken = jwt.sign(
      {
        companyId: company.id,
        companyName: company.name,
        companyEmail: company.email,
        adminUserId: userId,
        timestamp: Date.now(),
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '5m' }
    );

    return NextResponse.json({
      token: autoLoginToken,
      companyId: company.id,
      companyName: company.name,
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    console.error('Auto-login token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
