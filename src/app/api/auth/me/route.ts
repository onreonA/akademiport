/**
 * API Route: Get Current User
 *
 * GET /api/auth/me
 */

import { NextResponse } from 'next/server';
import { AuthService } from '@/application/services/auth.service';

export async function GET() {
  try {
    const result = await AuthService.getCurrentUser();

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const user = result.value;

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch {
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken hata oluştu' },
      { status: 500 }
    );
  }
}
