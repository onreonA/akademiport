/**
 * API Route: Sign Up
 *
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/application/services/auth.service';
import { UserRole } from '@/domain/enums/UserRole';

// TODO: User DTOs will be created in Sprint 5
interface CreateUserDto {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  role?: UserRole;
  companyId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserDto = await request.json();

    // Validation
    if (!body.email || !body.password || !body.fullName) {
      return NextResponse.json({ error: 'Email, şifre ve tam ad zorunludur' }, { status: 400 });
    }

    // Sign up
    const result = await AuthService.signUp(body);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
        message: 'Kayıt başarılı! Email adresinizi doğrulayın.',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu' }, { status: 500 });
  }
}
