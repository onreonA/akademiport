/**
 * API Route: Sign Out
 *
 * POST /api/auth/signout
 */

import { NextResponse } from 'next/server';
import { AuthService } from '@/application/services/auth.service';

export async function POST() {
  try {
    const result = await AuthService.signOut();

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Çıkış başarılı',
    });
  } catch {
    return NextResponse.json({ error: 'Çıkış sırasında bir hata oluştu' }, { status: 500 });
  }
}
