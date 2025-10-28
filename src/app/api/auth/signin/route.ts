/**
 * API Route: Sign In
 *
 * POST /api/auth/signin
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/application/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre zorunludur' }, { status: 400 });
    }

    // Sign in
    const result = await AuthService.signIn(email, password);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
      message: 'Giriş başarılı',
    });
  } catch {
    return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 });
  }
}
