import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
    // Güvenli JWT token oluştur
    const jwtToken = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        company_id: result.user.company_id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 saat
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    // Güvenli authentication cookie set et
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true, // XSS koruması
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // CSRF koruması
      maxAge: 60 * 60 * 2, // 2 saat
      path: '/'
    });
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
