import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireAdmin, requireCompany, createAuthErrorResponse } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
  try {
    // JWT Authentication - Choose the appropriate function based on endpoint requirements
    const user = await requireAuth(request);
    // For admin-only endpoints:
    // const user = await requireAdmin(request);
    // For company-only endpoints:
    // const user = await requireCompany(request);
    
    const supabase = createClient();
    
    // Your existing business logic here
    // Use user.email, user.role, user.company_id from JWT token
    
    // Example:
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      // For company-specific data filtering:
      // .eq('company_id', user.company_id)
      .limit(10);
      
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data
    });
    
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required' || 
        error.message === 'Admin access required' ||
        error.message === 'Company access required') {
      return createAuthErrorResponse(error.message, 401);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
