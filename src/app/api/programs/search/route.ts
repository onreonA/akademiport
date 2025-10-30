/**
 * API Route: Search Programs
 *
 * GET /api/programs/search?q=query - Search programs by name, description, or city
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/4-infrastructure/database/repositories/ProgramRepository';

const programRepository = new ProgramRepository();

/**
 * GET /api/programs/search?q=query
 * Search programs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arama terimi (q) zorunludur',
        },
        { status: 400 }
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arama terimi en az 2 karakter olmalıdır',
        },
        { status: 400 }
      );
    }

    // Execute search
    const result = await programRepository.search(query.trim());

    if (result.isFailure) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
        count: result.value?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Search programs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Arama yapılırken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

