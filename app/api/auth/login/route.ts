import jwt from 'jsonwebtoken';
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
    // Güvenli JWT token oluştur
    const jwtToken = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        company_id: result.user.company_id,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '2h' } // 2 saat
    );

    // Güvenli authentication cookie set et
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true, // XSS koruması
      secure: isProduction, // Production'da HTTPS için true
      sameSite: 'lax', // CSRF koruması
      maxAge: 60 * 60 * 2, // 2 saat
      path: '/',
      domain: isProduction ? '.akademiport.com' : undefined, // Production'da domain belirt
    });
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
