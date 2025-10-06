import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/lib/auth-service';
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    // Yeni auth service kullan
    const result = await authService.signIn({ email, password });
    // Cookie'leri set et
    const response = NextResponse.json({
      user: result.user,
      session: result.session,
    });
    // Authentication cookie'lerini set et (httpOnly: false - client-side okunabilir)
    response.cookies.set('auth-user-email', result.user.email, {
      httpOnly: false, // Client-side'da okunabilir
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });
    response.cookies.set('auth-user-role', result.user.role, {
      httpOnly: false, // Client-side'da okunabilir
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });
    // Company ID varsa onu da set et
    if (result.user.company_id) {
      response.cookies.set('auth-user-company-id', result.user.company_id, {
        httpOnly: false, // Client-side'da okunabilir
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 gün
      });
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
