import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/lib/auth-service';
export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();
    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    // Auth service ile refresh işlemi
    const result = await authService.refreshSession(refresh_token);
    if (!result) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }
    return NextResponse.json({
      user: result.user,
      session: result.session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
