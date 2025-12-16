import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('📥 Login request received:', {
      email,
      hasPassword: !!password,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
    });

    // JWT_SECRET kontrolü
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
      console.error('❌ JWT_SECRET is missing or using default value');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Supabase environment variables kontrolü
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔧 Environment check:', {
      hasJwtSecret: !!jwtSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      hasSupabaseServiceKey: !!supabaseServiceKey,
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error. Database connection failed.' },
        { status: 500 }
      );
    }

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
      jwtSecret,
      { expiresIn: '2h' } // 2 saat
    );

    // Güvenli authentication cookie set et
    // Vercel production kontrolü: hem NODE_ENV hem de VERCEL env var'ını kontrol et
    const isProduction =
      process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    const isVercelProduction = process.env.VERCEL === '1';
    const requestHost = request.headers.get('host') || '';

    console.log('🍪 Cookie configuration:', {
      isProduction,
      isVercelProduction,
      requestHost,
      nodeEnv: process.env.NODE_ENV,
    });

    // Cookie ayarları
    const cookieOptions: any = {
      httpOnly: true, // XSS koruması
      secure: isProduction, // Production'da HTTPS için true
      sameSite: 'lax' as const, // CSRF koruması
      maxAge: 60 * 60 * 2, // 2 saat
      path: '/',
    };

    // Domain ayarı: Vercel'de domain belirtmemek daha güvenli
    // Vercel otomatik olarak doğru domain'i kullanır
    // Sadece custom domain'de ve production'da domain belirt
    if (isVercelProduction) {
      // Vercel'de domain belirtme - Vercel otomatik olarak doğru domain'i kullanır
      // Domain belirtmek cookie'nin çalışmamasına neden olabilir
      console.log(
        '🍪 Using Vercel default cookie domain (no domain specified)'
      );
    } else if (isProduction && requestHost.includes('akademiport.com')) {
      // Custom domain'de ve production'da domain belirt
      cookieOptions.domain = '.akademiport.com';
      console.log('🍪 Using custom domain cookie:', cookieOptions.domain);
    } else {
      console.log('🍪 Using default cookie (no domain specified)');
    }

    response.cookies.set('auth-token', jwtToken, cookieOptions);

    // Response header'larına cookie bilgisini ekle (debug için)
    response.headers.set('X-Set-Cookie', 'auth-token');
    response.headers.set('X-Cookie-Domain', cookieOptions.domain || 'default');
    response.headers.set('X-Cookie-Secure', String(cookieOptions.secure));

    console.log('✅ Login successful', {
      email: result.user.email,
      role: result.user.role,
      isProduction,
      cookieDomain: cookieOptions.domain || 'default',
      cookieSecure: cookieOptions.secure,
      cookieHttpOnly: cookieOptions.httpOnly,
    });

    return response;
  } catch (error: any) {
    console.error('❌ Login error:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
